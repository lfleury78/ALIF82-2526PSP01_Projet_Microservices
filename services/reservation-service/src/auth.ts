import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";

type AuthUser = {
  sub: string;
  email?: string;
  preferred_username?: string;
  roles: string[];
};

type AuthMode = "off" | "optional" | "required";

declare global {
  // eslint-disable-next-line no-var
  var __auth_jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
}

function authMode(): AuthMode {
  const mode = (process.env.AUTH_MODE ?? "optional").toLowerCase();
  if (mode === "off" || mode === "optional" || mode === "required") return mode;
  return "optional";
}

function getJwks() {
  const jwksUrl = process.env.KEYCLOAK_JWKS_URL;
  if (!jwksUrl) return null;
  if (!global.__auth_jwks) global.__auth_jwks = createRemoteJWKSet(new URL(jwksUrl));
  return global.__auth_jwks;
}

function extractBearerToken(req: Request) {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const mode = authMode();
  if (mode === "off") {
    (req as any).user = null;
    next();
    return;
  }

  const issuer = process.env.KEYCLOAK_ISSUER;
  const audience = process.env.KEYCLOAK_AUDIENCE;
  const jwks = getJwks();

  if (!issuer || !jwks) {
    if (mode === "required") {
      res.status(500).json({
        error: "auth_not_configured",
        message: "KEYCLOAK_ISSUER / KEYCLOAK_JWKS_URL must be set",
      });
      return;
    }
    (req as any).user = null;
    next();
    return;
  }

  const token = extractBearerToken(req);
  if (!token) {
    if (mode === "required") {
      res.status(401).json({ error: "missing_token" });
      return;
    }
    (req as any).user = null;
    next();
    return;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: audience || undefined,
    });

    const roles =
      (payload.realm_access as any)?.roles ??
      (payload.resource_access as any)?.account?.roles ??
      [];

    (req as any).user = {
      sub: String(payload.sub ?? ""),
      email: payload.email as any,
      preferred_username: payload.preferred_username as any,
      roles: Array.isArray(roles) ? roles.map(String) : [],
    } satisfies AuthUser;

    next();
  } catch {
    if (mode === "required") {
      res.status(401).json({ error: "invalid_token" });
      return;
    }
    (req as any).user = null;
    next();
  }
}

