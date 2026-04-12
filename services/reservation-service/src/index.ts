import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import { pool } from "./db";
import { requireAuth } from "./auth";

const app = express();
const apiRouter = Router();

app.use(cors());
app.use(express.json());

function parseDateOnly(value: any): string | null {
  if (typeof value !== "string") return null;
  // expects YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function nightsBetween(dateDebut: string, dateFin: string): number {
  const start = new Date(`${dateDebut}T00:00:00Z`).getTime();
  const end = new Date(`${dateFin}T00:00:00Z`).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

apiRouter.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1 as ok");
    res.json({ ok: true, db: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, db: false, error: String(e?.message ?? e) });
  }
});

// List reservations (filters: locataire, annonce, statut)
apiRouter.get("/reservations", requireAuth, async (req, res) => {
  const idLocataire = req.query.id_locataire ? Number(req.query.id_locataire) : null;
  const idAnnonce = req.query.id_annonce ? Number(req.query.id_annonce) : null;
  const statut = (req.query.statut as string | undefined) ?? null;

  const where: string[] = [];
  const params: any[] = [];

  if (idLocataire !== null && Number.isFinite(idLocataire)) {
    where.push("r.id_locataire = ?");
    params.push(idLocataire);
  }
  if (idAnnonce !== null && Number.isFinite(idAnnonce)) {
    where.push("r.id_annonce = ?");
    params.push(idAnnonce);
  }
  if (statut) {
    where.push("r.statut = ?");
    params.push(statut);
  }

  const sql =
    `
    SELECT
      r.id_reservation,
      r.id_annonce,
      r.id_locataire,
      r.date_debut,
      r.date_fin,
      r.nb_voyageurs,
      r.prix_total,
      r.statut,
      r.date_creation
    FROM reservation r
    ` +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY r.date_creation DESC";

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

apiRouter.get("/reservations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const [rows] = await pool.query(
    `
    SELECT
      r.id_reservation,
      r.id_annonce,
      r.id_locataire,
      r.date_debut,
      r.date_fin,
      r.nb_voyageurs,
      r.prix_total,
      r.statut,
      r.date_creation
    FROM reservation r
    WHERE r.id_reservation=?
    `,
    [id]
  );
  const reservation = (rows as any[])[0];
  if (!reservation) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(reservation);
});

// Delete reservation
apiRouter.delete("/reservations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [result] = await pool.query("DELETE FROM reservation WHERE id_reservation=?", [id]);
  if ((result as any).affectedRows === 0) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.json({ ok: true });
});

// Create reservation:
// body: { id_annonce, id_locataire, date_debut (YYYY-MM-DD), date_fin (YYYY-MM-DD), nb_voyageurs }
apiRouter.post("/reservations", requireAuth, async (req, res) => {
  const idAnnonce = Number(req.body?.id_annonce);
  const idLocataire = Number(req.body?.id_locataire);
  const dateDebut = parseDateOnly(req.body?.date_debut);
  const dateFin = parseDateOnly(req.body?.date_fin);
  const nbVoyageurs = Number(req.body?.nb_voyageurs ?? 1);

  if (!Number.isFinite(idAnnonce) || !Number.isFinite(idLocataire) || !dateDebut || !dateFin) {
    res.status(400).json({ error: "missing_or_invalid_fields" });
    return;
  }

  if (!Number.isFinite(nbVoyageurs) || nbVoyageurs <= 0) {
    res.status(400).json({ error: "invalid_nb_voyageurs" });
    return;
  }

  const nights = nightsBetween(dateDebut, dateFin);
  if (nights <= 0) {
    res.status(400).json({ error: "invalid_dates", message: "date_fin must be after date_debut" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check annonce exists + nightly price + available flag
    const [annonceRows] = await conn.query(
      "SELECT id_annonce, id_logement, prix_par_nuit, disponible, statut FROM annonce WHERE id_annonce=? FOR UPDATE",
      [idAnnonce]
    );
    const annonce = (annonceRows as any[])[0];
    if (!annonce) {
      await conn.rollback();
      res.status(404).json({ error: "annonce_not_found" });
      return;
    }
    if (!annonce.disponible || annonce.statut !== "ACTIVE") {
      await conn.rollback();
      res.status(409).json({ error: "annonce_not_available" });
      return;
    }

    // Check overlapping reservations for the same logement (pending/confirmed)
    const [overlapRows] = await conn.query(
      `
      SELECT id_reservation
      FROM reservation r
      JOIN annonce a ON a.id_annonce = r.id_annonce
      WHERE a.id_logement=?
        AND r.statut IN ('EN_ATTENTE','CONFIRMEE')
        AND NOT (r.date_fin <= ? OR r.date_debut >= ?)
      LIMIT 1
      FOR UPDATE
      `,
      [annonce.id_logement, dateDebut, dateFin]
    );
    if ((overlapRows as any[]).length > 0) {
      await conn.rollback();
      res.status(409).json({
        error: "date_conflict",
        message: "Le logement est déjà réservé pendant cette période",
      });
      return;
    }

    const prixTotal = Number(annonce.prix_par_nuit) * nights;
    const [result] = await conn.query(
      `
      INSERT INTO reservation (id_annonce, id_locataire, date_debut, date_fin, nb_voyageurs, prix_total, statut)
      VALUES (?, ?, ?, ?, ?, ?, 'EN_ATTENTE')
      `,
      [idAnnonce, idLocataire, dateDebut, dateFin, nbVoyageurs, prixTotal]
    );

    await conn.commit();
    res.status(201).json({ id_reservation: (result as any).insertId, prix_total: prixTotal, nights });
  } catch (e: any) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }
    res.status(500).json({ error: "internal_error", message: String(e?.message ?? e) });
  } finally {
    conn.release();
  }
});

// Validate reservation (CONFIRMEE)
// POST /reservations/:id/validate
apiRouter.post("/reservations/:id/validate", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [reservationRows] = await conn.query(
      "SELECT id_reservation, id_annonce, date_debut, date_fin, statut FROM reservation WHERE id_reservation=? FOR UPDATE",
      [id]
    );
    const reservation = (reservationRows as any[])[0];
    if (!reservation) {
      await conn.rollback();
      res.status(404).json({ error: "not_found" });
      return;
    }

    if (reservation.statut === "CONFIRMEE") {
      await conn.commit();
      res.json({ ok: true, statut: "CONFIRMEE" });
      return;
    }

    if (reservation.statut !== "EN_ATTENTE") {
      await conn.rollback();
      res.status(409).json({
        error: "invalid_transition",
        from: reservation.statut,
        to: "CONFIRMEE",
      });
      return;
    }

    const [annonceRows] = await conn.query(
      "SELECT id_annonce, id_logement FROM annonce WHERE id_annonce=? FOR UPDATE",
      [reservation.id_annonce]
    );
    const annonce = (annonceRows as any[])[0];
    if (!annonce) {
      await conn.rollback();
      res.status(404).json({ error: "annonce_not_found" });
      return;
    }

    const [overlapRows] = await conn.query(
      `
      SELECT r2.id_reservation
      FROM reservation r2
      JOIN annonce a2 ON a2.id_annonce = r2.id_annonce
      WHERE a2.id_logement=?
        AND r2.id_reservation <> ?
        AND r2.statut IN ('EN_ATTENTE','CONFIRMEE')
        AND NOT (r2.date_fin <= ? OR r2.date_debut >= ?)
      LIMIT 1
      FOR UPDATE
      `,
      [annonce.id_logement, id, reservation.date_debut, reservation.date_fin]
    );

    if ((overlapRows as any[]).length > 0) {
      await conn.rollback();
      res.status(409).json({
        error: "date_conflict",
        message: "Le logement est déjà réservé pendant cette période",
      });
      return;
    }

    const [result] = await conn.query("UPDATE reservation SET statut='CONFIRMEE' WHERE id_reservation=?", [
      id,
    ]);
    await conn.commit();

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true, statut: "CONFIRMEE" });
  } catch (e: any) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }
    res.status(500).json({ error: "internal_error", message: String(e?.message ?? e) });
  } finally {
    conn.release();
  }
});

// Update status
// body: { statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE' }
apiRouter.patch("/reservations/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const statut = req.body?.statut as string | undefined;
  const allowed = new Set(["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "TERMINEE"]);

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  if (!statut || !allowed.has(statut)) {
    res.status(400).json({ error: "invalid_status" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [reservationRows] = await conn.query(
      "SELECT id_reservation, id_annonce, date_debut, date_fin, statut FROM reservation WHERE id_reservation=? FOR UPDATE",
      [id]
    );
    const reservation = (reservationRows as any[])[0];
    if (!reservation) {
      await conn.rollback();
      res.status(404).json({ error: "not_found" });
      return;
    }

    if (statut === "CONFIRMEE") {
      const [annonceRows] = await conn.query(
        "SELECT id_annonce, id_logement FROM annonce WHERE id_annonce=? FOR UPDATE",
        [reservation.id_annonce]
      );
      const annonce = (annonceRows as any[])[0];
      if (!annonce) {
        await conn.rollback();
        res.status(404).json({ error: "annonce_not_found" });
        return;
      }

      const [overlapRows] = await conn.query(
        `
        SELECT r2.id_reservation
        FROM reservation r2
        JOIN annonce a2 ON a2.id_annonce = r2.id_annonce
        WHERE a2.id_logement=?
          AND r2.id_reservation <> ?
          AND r2.statut IN ('EN_ATTENTE','CONFIRMEE')
          AND NOT (r2.date_fin <= ? OR r2.date_debut >= ?)
        LIMIT 1
        FOR UPDATE
        `,
        [annonce.id_logement, id, reservation.date_debut, reservation.date_fin]
      );

      if ((overlapRows as any[]).length > 0) {
        await conn.rollback();
        res.status(409).json({
          error: "date_conflict",
          message: "Le logement est déjà réservé pendant cette période",
        });
        return;
      }
    }

    const [result] = await conn.query("UPDATE reservation SET statut=? WHERE id_reservation=?", [
      statut,
      id,
    ]);
    await conn.commit();

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true });
  } catch (e: any) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }
    res.status(500).json({ error: "internal_error", message: String(e?.message ?? e) });
  } finally {
    conn.release();
  }
});

// Mount the API router on /api prefix
app.use("/api", apiRouter);

const port = Number(process.env.PORT ?? "3003");
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`reservation-service listening on :${port}`);
});

