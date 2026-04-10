"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jose_1 = require("jose");
function authMode() {
    const mode = (process.env.AUTH_MODE ?? "optional").toLowerCase();
    if (mode === "off" || mode === "optional" || mode === "required")
        return mode;
    return "optional";
}
function getJwks() {
    const jwksUrl = process.env.KEYCLOAK_JWKS_URL;
    if (!jwksUrl)
        return null;
    if (!global.__auth_jwks)
        global.__auth_jwks = (0, jose_1.createRemoteJWKSet)(new URL(jwksUrl));
    return global.__auth_jwks;
}
function extractBearerToken(req) {
    const header = req.header("authorization") ?? req.header("Authorization");
    if (!header)
        return null;
    const [type, token] = header.split(" ");
    if (type?.toLowerCase() !== "bearer" || !token)
        return null;
    return token;
}
async function requireAuth(req, res, next) {
    const mode = authMode();
    if (mode === "off") {
        req.user = null;
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
        req.user = null;
        next();
        return;
    }
    const token = extractBearerToken(req);
    if (!token) {
        if (mode === "required") {
            res.status(401).json({ error: "missing_token" });
            return;
        }
        req.user = null;
        next();
        return;
    }
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, jwks, {
            issuer,
            audience: audience || undefined,
        });
        const roles = payload.realm_access?.roles ??
            payload.resource_access?.account?.roles ??
            [];
        req.user = {
            sub: String(payload.sub ?? ""),
            email: payload.email,
            preferred_username: payload.preferred_username,
            roles: Array.isArray(roles) ? roles.map(String) : [],
        };
        next();
    }
    catch {
        if (mode === "required") {
            res.status(401).json({ error: "invalid_token" });
            return;
        }
        req.user = null;
        next();
    }
}
