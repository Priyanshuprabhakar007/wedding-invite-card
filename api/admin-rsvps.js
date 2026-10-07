const { isAuthenticated } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!isAuthenticated(req, sessionSecret)) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized access. Please log in."
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("[ADMIN RSVPS] Missing Supabase environment variables.");
      return res.status(500).json({
        success: false,
        error: "Server configuration error."
      });
    }

    const endpoint = `${supabaseUrl}/rest/v1/wedding_rsvps?select=*&order=created_at.desc`;
    const abortController = new AbortController();
    const abortTimeout = setTimeout(() => abortController.abort(), 8000);

    const response = await fetch(endpoint, {
      method: "GET",
      signal: abortController.signal,
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
        "Content-Type": "application/json"
      }
    });
    clearTimeout(abortTimeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ADMIN RSVPS] Supabase query failed:", response.status, errText);
      return res.status(500).json({
        success: false,
        error: "Unable to load RSVP responses. Please try again."
      });
    }

    const rsvps = await response.json();
    return res.status(200).json({
      success: true,
      rsvps: Array.isArray(rsvps) ? rsvps : []
    });
  } catch (error) {
    console.error("[ADMIN RSVPS] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to load RSVP responses. Please try again."
    });
  }
};
