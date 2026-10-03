const crypto = require("crypto");
const { createSessionCookie } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { password } = req.body || {};

    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      console.error("[ADMIN LOGIN] Missing server environment configuration (ADMIN_PASSWORD / ADMIN_SESSION_SECRET).");
      return res.status(500).json({
        success: false,
        error: "Server configuration error."
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: "Password is required."
      });
    }

    // Secure constant-time password comparison
    const inputHash = crypto.createHash("sha256").update(password.trim()).digest();
    const targetHash = crypto.createHash("sha256").update(adminPassword.trim()).digest();

    if (!crypto.timingSafeEqual(inputHash, targetHash)) {
      return res.status(401).json({
        success: false,
        error: "Incorrect admin password."
      });
    }

    // Set signed session cookie
    const isProduction = process.env.NODE_ENV === "production" || !!req.headers["x-forwarded-proto"];
    const cookie = createSessionCookie(sessionSecret, isProduction);

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({
      success: true,
      message: "Authentication successful."
    });
  } catch (error) {
    console.error("[ADMIN LOGIN] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed. Please try again."
    });
  }
};
