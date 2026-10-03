const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers && req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach(function (cookie) {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      list[name] = decodeURIComponent(val);
    }
  });

  return list;
}

function signToken(payload, secret) {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  try {
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload.admin || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function createSessionCookie(secret, isProduction = false) {
  const exp = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const token = signToken({ admin: true, exp }, secret);
  const secureFlag = isProduction || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; SameSite=Lax${secureFlag}`;
}

function clearSessionCookie(isProduction = false) {
  const secureFlag = isProduction || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
}

function isAuthenticated(req, secret) {
  if (!secret) return false;
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  const valid = verifyToken(token, secret);
  return !!valid;
}

module.exports = {
  COOKIE_NAME,
  parseCookies,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticated
};
