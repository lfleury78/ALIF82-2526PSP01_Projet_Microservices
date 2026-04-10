CREATE DATABASE IF NOT EXISTS hessbnb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hessbnb;

CREATE TABLE utilisateur (
    id_user          INT PRIMARY KEY AUTO_INCREMENT,
    nom              VARCHAR(100) NOT NULL,
    prenom           VARCHAR(100) NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe     VARCHAR(255) NOT NULL,
    role             ENUM('LOCATAIRE', 'PROPRIETAIRE', 'LES_DEUX') DEFAULT 'LOCATAIRE',
    telephone        VARCHAR(20),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logement (
    id_logement      INT PRIMARY KEY AUTO_INCREMENT,
    id_proprietaire  INT NOT NULL,
    type_logement    ENUM('APPARTEMENT', 'MAISON', 'STUDIO', 'VILLA') NOT NULL,
    ville            VARCHAR(100) NOT NULL,
    adresse          VARCHAR(255),
    capacite         INT NOT NULL,
    nb_chambres      INT DEFAULT 1,
    date_creation    DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logement_proprietaire FOREIGN KEY (id_proprietaire)
        REFERENCES utilisateur (id_user) ON DELETE RESTRICT
);

CREATE INDEX idx_logement_ville        ON logement (ville);
CREATE INDEX idx_logement_proprietaire ON logement (id_proprietaire);
CREATE INDEX idx_logement_type         ON logement (type_logement);

CREATE TABLE annonce (
    id_annonce       INT PRIMARY KEY AUTO_INCREMENT,
    id_logement      INT NOT NULL,
    titre            VARCHAR(200) NOT NULL,
    description      TEXT,
    prix_par_nuit    DECIMAL(10,2) NOT NULL,
    disponible       BOOLEAN DEFAULT TRUE,
    statut           ENUM('ACTIVE', 'PAUSE', 'SUPPRIMEE') DEFAULT 'ACTIVE',
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_annonce_logement FOREIGN KEY (id_logement)
        REFERENCES logement (id_logement) ON DELETE CASCADE
);

CREATE INDEX idx_annonce_logement   ON annonce (id_logement);
CREATE INDEX idx_annonce_statut     ON annonce (statut);
CREATE INDEX idx_annonce_disponible ON annonce (disponible);
CREATE INDEX idx_annonce_prix       ON annonce (prix_par_nuit);

CREATE TABLE image_annonce (
    id_image       INT PRIMARY KEY AUTO_INCREMENT,
    id_annonce     INT NOT NULL,
    chemin         VARCHAR(500) NOT NULL,
    est_principale BOOLEAN DEFAULT FALSE,
    date_ajout     DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_image_annonce FOREIGN KEY (id_annonce)
        REFERENCES annonce (id_annonce) ON DELETE CASCADE
);

CREATE INDEX idx_image_annonce ON image_annonce (id_annonce);

CREATE TABLE reservation (
    id_reservation INT PRIMARY KEY AUTO_INCREMENT,
    id_annonce     INT NOT NULL,
    id_locataire   INT NOT NULL,
    date_debut     DATE NOT NULL,
    date_fin       DATE NOT NULL,
    nb_voyageurs   INT NOT NULL,
    prix_total     DECIMAL(10,2) NOT NULL,
    statut         ENUM('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE') DEFAULT 'EN_ATTENTE',
    date_creation  DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservation_annonce   FOREIGN KEY (id_annonce)   REFERENCES annonce     (id_annonce) ON DELETE RESTRICT,
    CONSTRAINT fk_reservation_locataire FOREIGN KEY (id_locataire) REFERENCES utilisateur (id_user)    ON DELETE RESTRICT,
    CONSTRAINT chk_reservation_dates    CHECK (date_fin > date_debut)
);

CREATE INDEX idx_reservation_annonce   ON reservation (id_annonce);
CREATE INDEX idx_reservation_locataire ON reservation (id_locataire);
CREATE INDEX idx_reservation_statut    ON reservation (statut);
CREATE INDEX idx_reservation_dates     ON reservation (id_annonce, statut, date_debut, date_fin);

CREATE TABLE avis (
    id_avis        INT PRIMARY KEY AUTO_INCREMENT,
    id_reservation INT NOT NULL,
    id_annonce     INT NOT NULL,
    id_auteur      INT NOT NULL,
    note           INT NOT NULL,
    commentaire    TEXT,
    date_avis      DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avis_reservation FOREIGN KEY (id_reservation) REFERENCES reservation (id_reservation) ON DELETE CASCADE,
    CONSTRAINT fk_avis_annonce     FOREIGN KEY (id_annonce)     REFERENCES annonce     (id_annonce)     ON DELETE CASCADE,
    CONSTRAINT fk_avis_auteur      FOREIGN KEY (id_auteur)      REFERENCES utilisateur (id_user)        ON DELETE CASCADE,
    CONSTRAINT uq_avis_reservation UNIQUE (id_reservation),
    CONSTRAINT chk_avis_note       CHECK (note BETWEEN 1 AND 5)
);

CREATE INDEX idx_avis_annonce ON avis (id_annonce);
CREATE INDEX idx_avis_auteur  ON avis (id_auteur);

CREATE TABLE conversation (
    id_conversation  INT PRIMARY KEY AUTO_INCREMENT,
    id_user_1        INT NOT NULL,
    id_user_2        INT NOT NULL,
    id_annonce       INT,
    date_creation    DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_dernier_msg DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation_user1   FOREIGN KEY (id_user_1)  REFERENCES utilisateur (id_user)  ON DELETE CASCADE,
    CONSTRAINT fk_conversation_user2   FOREIGN KEY (id_user_2)  REFERENCES utilisateur (id_user)  ON DELETE CASCADE,
    CONSTRAINT fk_conversation_annonce FOREIGN KEY (id_annonce) REFERENCES annonce     (id_annonce) ON DELETE SET NULL
);

CREATE INDEX idx_conversation_users   ON conversation (id_user_1, id_user_2);
CREATE INDEX idx_conversation_annonce ON conversation (id_annonce);

CREATE TABLE message (
    id_message      INT PRIMARY KEY AUTO_INCREMENT,
    id_conversation INT NOT NULL,
    id_expediteur   INT NOT NULL,
    contenu         TEXT NOT NULL,
    lu              BOOLEAN DEFAULT FALSE,
    date_envoi      DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_conversation FOREIGN KEY (id_conversation) REFERENCES conversation (id_conversation) ON DELETE CASCADE,
    CONSTRAINT fk_message_expediteur   FOREIGN KEY (id_expediteur)   REFERENCES utilisateur  (id_user)         ON DELETE CASCADE
);

CREATE INDEX idx_message_conversation ON message (id_conversation);
CREATE INDEX idx_message_expediteur   ON message (id_expediteur);
CREATE INDEX idx_message_lu           ON message (id_conversation, lu);

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, telephone) VALUES
('Martin',    'Sophie',   'sophie.martin@email.fr',   '$2b$10$hashed1', 'PROPRIETAIRE', '0612345678'),
('Dubois',    'Thomas',   'thomas.dubois@email.fr',   '$2b$10$hashed2', 'LES_DEUX',     '0623456789'),
('Bernard',   'Camille',  'camille.bernard@email.fr', '$2b$10$hashed3', 'LOCATAIRE',    '0634567890'),
('Leroy',     'Lucas',    'lucas.leroy@email.fr',     '$2b$10$hashed4', 'LOCATAIRE',    '0645678901'),
('Moreau',    'Emma',     'emma.moreau@email.fr',     '$2b$10$hashed5', 'PROPRIETAIRE', '0656789012'),
('Simon',     'Hugo',     'hugo.simon@email.fr',      '$2b$10$hashed6', 'LOCATAIRE',    '0667890123'),
('Laurent',   'Léa',      'lea.laurent@email.fr',     '$2b$10$hashed7', 'LES_DEUX',     '0678901234'),
('Michel',    'Antoine',  'antoine.michel@email.fr',  '$2b$10$hashed8', 'LOCATAIRE',    '0689012345');

INSERT INTO logement (id_proprietaire, type_logement, ville, adresse, capacite, nb_chambres) VALUES
(1, 'APPARTEMENT', 'Paris',      '12 rue de Rivoli, 75001',          4, 2),
(1, 'STUDIO',      'Paris',      '8 boulevard Haussmann, 75009',     2, 1),
(2, 'MAISON',      'Lyon',       '45 rue de la République, 69002',   6, 3),
(5, 'VILLA',       'Nice',       '3 promenade des Anglais, 06000',   8, 4),
(5, 'APPARTEMENT', 'Bordeaux',   '22 cours de l\'Intendance, 33000', 3, 1),
(7, 'MAISON',      'Marseille',  '17 rue Paradis, 13008',            5, 2),
(2, 'STUDIO',      'Toulouse',   '9 rue Saint-Rome, 31000',          2, 1);

INSERT INTO annonce (id_logement, titre, description, prix_par_nuit, disponible, statut) VALUES
(1, 'Bel appartement au cœur de Paris',         'Appartement lumineux de 60m² avec vue sur la Seine. Idéal pour un séjour en amoureux ou en famille.', 120.00, TRUE,  'ACTIVE'),
(2, 'Studio cosy près des Grands Boulevards',   'Studio entièrement rénové, calme et bien équipé. Accès facile à tous les transports.',                  65.00, TRUE,  'ACTIVE'),
(3, 'Grande maison familiale à Lyon',           'Maison de caractère avec jardin et terrasse. Parfait pour les familles ou groupes d\'amis.',            150.00, TRUE,  'ACTIVE'),
(4, 'Villa avec piscine sur la Côte d\'Azur',   'Somptueuse villa avec piscine privée et vue mer. Idéale pour des vacances d\'exception.',               350.00, TRUE,  'ACTIVE'),
(5, 'Appartement moderne à Bordeaux',           'Appartement neuf proche du centre-ville et des vignobles. Décoration soignée.',                         85.00, FALSE, 'PAUSE'),
(6, 'Maison provençale à Marseille',            'Charmante maison avec terrasse ensoleillée. À deux pas du Vieux-Port et des calanques.',                130.00, TRUE,  'ACTIVE'),
(7, 'Studio étudiant à Toulouse',               'Studio bien placé proche de la fac et du métro. Tout équipé pour un séjour confortable.',               45.00, TRUE,  'ACTIVE');

INSERT INTO image_annonce (id_annonce, chemin, est_principale) VALUES
(1, 'uploads/annonces/1/salon.jpg',         TRUE),
(1, 'uploads/annonces/1/chambre.jpg',       FALSE),
(1, 'uploads/annonces/1/cuisine.jpg',       FALSE),
(2, 'uploads/annonces/2/principal.jpg',     TRUE),
(2, 'uploads/annonces/2/salle_de_bain.jpg', FALSE),
(3, 'uploads/annonces/3/facade.jpg',        TRUE),
(3, 'uploads/annonces/3/jardin.jpg',        FALSE),
(3, 'uploads/annonces/3/salon.jpg',         FALSE),
(4, 'uploads/annonces/4/piscine.jpg',       TRUE),
(4, 'uploads/annonces/4/vue_mer.jpg',       FALSE),
(4, 'uploads/annonces/4/chambre1.jpg',      FALSE),
(4, 'uploads/annonces/4/terrasse.jpg',      FALSE),
(5, 'uploads/annonces/5/entree.jpg',        TRUE),
(6, 'uploads/annonces/6/terrasse.jpg',      TRUE),
(6, 'uploads/annonces/6/interieur.jpg',     FALSE),
(7, 'uploads/annonces/7/principal.jpg',     TRUE);

INSERT INTO reservation (id_annonce, id_locataire, date_debut, date_fin, nb_voyageurs, prix_total, statut) VALUES
(1, 3, '2026-04-15', '2026-04-20', 2,  600.00,  'CONFIRMEE'),
(1, 4, '2026-05-01', '2026-05-05', 2,  480.00,  'EN_ATTENTE'),
(3, 6, '2026-04-10', '2026-04-17', 4,  1050.00, 'CONFIRMEE'),
(4, 3, '2026-07-01', '2026-07-10', 6,  3150.00, 'CONFIRMEE'),
(4, 8, '2026-08-05', '2026-08-12', 4,  2450.00, 'EN_ATTENTE'),
(6, 4, '2026-04-22', '2026-04-25', 2,  390.00,  'CONFIRMEE'),
(2, 6, '2026-03-01', '2026-03-04', 1,  195.00,  'TERMINEE'),
(7, 8, '2026-03-10', '2026-03-15', 1,  225.00,  'ANNULEE');

INSERT INTO avis (id_reservation, id_annonce, id_auteur, note, commentaire) VALUES
(7, 2, 6, 5, 'Studio parfait, très propre et bien situé. Le propriétaire est très réactif. Je recommande vivement !'),
(3, 3, 6, 4, 'Très belle maison, grand espace et jardin agréable. Quelques petits détails à améliorer mais globalement excellent séjour.');

INSERT INTO conversation (id_user_1, id_user_2, id_annonce) VALUES
(3, 1, 1),
(4, 1, 1),
(6, 2, 3),
(3, 5, 4),
(8, 5, 4);

INSERT INTO message (id_conversation, id_expediteur, contenu, lu) VALUES
(1, 3, 'Bonjour, l\'appartement est-il disponible du 15 au 20 avril ?',                  TRUE),
(1, 1, 'Bonjour Camille ! Oui tout à fait, je vous confirme la disponibilité.',           TRUE),
(1, 3, 'Parfait, je fais la réservation de suite. Merci !',                               TRUE),
(2, 4, 'Bonsoir, est-ce que le parking est inclus ?',                                     TRUE),
(2, 1, 'Bonsoir Lucas, malheureusement non mais il y a un parking public à 50m.',         FALSE),
(3, 6, 'Bonjour, combien de personnes peuvent dormir dans la maison ?',                   TRUE),
(3, 2, 'Bonjour Hugo ! La maison peut accueillir jusqu\'à 6 personnes confortablement.',  TRUE),
(4, 3, 'Bonjour, la piscine est-elle chauffée ?',                                         TRUE),
(4, 5, 'Bonjour Camille, oui la piscine est chauffée de mai à septembre.',                FALSE),
(5, 8, 'Bonsoir, y a-t-il la climatisation dans la villa ?',                              FALSE);
