const { clearSessionCookie } = require("./_auth");

module.exports = async function handler(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === "production" || !!req.headers["x-forwarded-proto"];
    const cookie = clearSessionCookie(isProduction);

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    console.error("[ADMIN LOGOUT] Error logging out:", error);
    return res.status(500).json({
      success: false,
      error: "Logout failed."
    });
  }
};
