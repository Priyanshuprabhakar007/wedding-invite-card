const { isAuthenticated } = require("./_auth");

module.exports = async function handler(req, res) {
  try {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    const authenticated = isAuthenticated(req, sessionSecret);

    return res.status(200).json({
      authenticated: authenticated
    });
  } catch (error) {
    console.error("[ADMIN SESSION] Error checking session:", error);
    return res.status(200).json({
      authenticated: false
    });
  }
};
