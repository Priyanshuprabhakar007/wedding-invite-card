const { isAuthenticated } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!isAuthenticated(req, sessionSecret)) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    const id = req.query && req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "Missing RSVP id." });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    const abortController = new AbortController();
    const abortTimeout = setTimeout(() => abortController.abort(), 8000);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/wedding_rsvps?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        signal: abortController.signal,
        headers: {
          apikey: supabaseSecretKey,
          Authorization: `Bearer ${supabaseSecretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        }
      }
    );
    clearTimeout(abortTimeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ADMIN DELETE] Supabase delete failed:", response.status, errText);
      return res.status(500).json({ success: false, error: "Unable to delete RSVP." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[ADMIN DELETE] Unexpected error:", error);
    return res.status(500).json({ success: false, error: "Something went wrong." });
  }
};
