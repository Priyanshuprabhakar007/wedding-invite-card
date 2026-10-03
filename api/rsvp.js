module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    const {
      guestName,
      mobileNumber,
      attendance,
      guestCount,
      attendingEvents,
      inviteCode,
      invitationLabel,
      message
    } = req.body || {};

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !guestName ||
      typeof guestName !== "string" ||
      !guestName.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Guest name is required."
      });
    }

    if (
      !mobileNumber ||
      typeof mobileNumber !== "string" ||
      !mobileNumber.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required."
      });
    }

    const parsedGuestCount =
      Number(guestCount);

    if (
      !Number.isInteger(parsedGuestCount) ||
      parsedGuestCount < 1 ||
      parsedGuestCount > 10
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid guest count."
      });
    }

    const attendanceText =
      String(attendance || "")
        .trim()
        .toLowerCase();

    const normalizedAttendance =
      attendanceText.includes("decline") ||
      attendanceText === "no"
        ? "no"
        : "yes";

    const events =
      Array.isArray(attendingEvents)
        ? attendingEvents
            .filter(Boolean)
            .map(String)
        : [];

    // -------------------------------
    // SUPABASE ENVIRONMENT
    // -------------------------------

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseSecretKey
    ) {
      console.error(
        "[RSVP API] Supabase environment variables missing."
      );

      return res.status(500).json({
        success: false,
        error: "Server configuration error."
      });
    }

    // -------------------------------
    // INSERT INTO SUPABASE
    // -------------------------------

    const supabaseResponse =
      await fetch(
        supabaseUrl +
          "/rest/v1/wedding_rsvps",
        {
          method: "POST",

          headers: {
            apikey:
              supabaseSecretKey,

            Authorization:
              "Bearer " +
              supabaseSecretKey,

            "Content-Type":
              "application/json",

            Prefer:
              "return=representation"
          },

          body: JSON.stringify({
            guest_name:
              guestName.trim(),

            mobile_number:
              mobileNumber.trim(),

            attendance:
              normalizedAttendance,

            guest_count:
              parsedGuestCount,

            attending_events:
              events,

            invite_code:
              inviteCode || null,

            invitation_label:
              invitationLabel || null,

            message:
              typeof message === "string" &&
              message.trim()
                ? message.trim()
                : null
          })
        }
      );

    let result = null;

    try {
      result =
        await supabaseResponse.json();
    } catch (parseError) {
      result = null;
    }

    if (!supabaseResponse.ok) {

      console.error(
        "[RSVP API] Supabase insert failed:",
        supabaseResponse.status,
        result
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to save RSVP."
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "RSVP saved successfully.",
      rsvp:
        Array.isArray(result)
          ? result[0]
          : result
    });

  } catch (error) {

    console.error(
      "[RSVP API] Unexpected error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Something went wrong while saving the RSVP."
    });
  }
};
