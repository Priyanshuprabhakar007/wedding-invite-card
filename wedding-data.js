window.WEDDING_CONFIG = {
  active: true,
  theme: "crimson-chateau",
  couple: {
    partnerOne: "Isha",
    partnerTwo: "Sagar",
    connector: "&",
    shortNames: "Isha & Sagar",
    subGreeting: "Together with their families",
    subTagline: "invite you to celebrate the joyous union of love & togetherness"
  },
  event: {
    day: "18",
    month: "December",
    year: "2026",
    dateDisplay: "DECEMBER 2026",
    startDate: "2026-12-18T17:00:00+05:30",
    countdownDate: "2026-12-18T17:00:00+05:30",
    venue: "The Grand Royal Palace & Château",
    city: "Jaipur, Rajasthan",
    address: "Royal Heritage Greens, Jaipur, Rajasthan 302031",
    googleMapsUrl: "https://maps.google.com/?q=Jaipur+Rajasthan"
  },
  copy: {
    introAriaLabel: "Open Isha and Sagar's Wedding Invitation",
    openInvitation: "Click to Open",
    weddingDay: "The Wedding Celebration",
    dearFriends: "Dear Family & Friends,",
    letterOne: "Two souls, one heart, and a lifetime of love to share. As our beloved sister Isha begins her magical journey with Sagar, we feel immensely blessed and grateful.",
    letterTwo: "Your presence, warm blessings, and loving wishes mean the world to us as we come together to celebrate this unforgettable milestone of our family.",
    countdownTitle: "The Grand Celebration Begins In",
    countdownDays: "Days",
    countdownHours: "Hours",
    countdownMinutes: "Minutes",
    countdownSeconds: "Seconds",
    scheduleTitle: "Schedule of Events",
    locationTitle: "Location & Venue",
    addressPrefix: "Venue Address:",
    dressCodeTitle: "Dress Code & Attire",
    dressIntro: "We kindly invite you to grace this auspicious celebration in royal, vibrant & elegant attire.",
    gentlemen: "Gentlemen:",
    gentlemenText: "Royal Sherwanis, Bandhgalas, Kurta Pajama with Nehru Jackets, or Classic Tuxedos.",
    ladies: "Ladies:",
    ladiesText: "Graceful Lehengas, Designer Sarees, Anarkalis, or Elegant Evening Gowns.",
    detailsTitle: "Important Details",
    contactCopy: "For any assistance regarding travel, accommodation, or queries, please feel free to reach out to the wedding coordinators.",
    organizerName: "Goyal & Gupta Family",
    organizerPhone: "+91 98765 43210",
    organizerWhatsapp: "919876543210",
    giftCopy: "No boxed gifts please. Your warm presence, smiles, and heartfelt blessings are the greatest gifts to Isha & Sagar.",
    rsvpIntro: "Kindly confirm your presence by submitting the RSVP below or directly on WhatsApp to help us welcome you with warmth.",
    rsvpTitle: "Confirm Your Attendance",
    rsvpButton: "RSVP Now",
    signoff: "Looking forward to celebrating with you!",
    closingNames: "With Best Compliments from Family",
    playMusic: "Play Music",
    pauseMusic: "Pause Music",
    playSymbol: "▶",
    pauseSymbol: "⏸"
  },
  universalEventIds: [
    "baraat"
  ],
  invitationBundles: {
    allFunctions: [
      "mehendi",
      "sangeet",
      "haldi",
      "wedding",
      "reception"
    ],
    familyFunctions: [
      "sangeet",
      "haldi",
      "wedding",
      "reception"
    ],
    friendsFunctions: [
      "sangeet",
      "wedding",
      "reception"
    ],
    weddingFunctions: [
      "wedding",
      "reception"
    ],
    haldiFunctions: [
      "haldi"
    ]
  },
  inviteCodes: {
    "LOVERS": {
      label: "Complete Wedding Celebration",
      bundle: "allFunctions"
    },
    "FAMILY": {
      label: "Family Wedding Invitation",
      bundle: "familyFunctions"
    },
    "FRIENDS": {
      label: "Friends Celebration Invitation",
      bundle: "friendsFunctions"
    },
    "PHERAS": {
      label: "Wedding Ceremony Invitation",
      bundle: "weddingFunctions"
    },
    "KESAR": {
      label: "Haldi Celebration Invitation",
      bundle: "haldiFunctions"
    }
  },
  events: [
    {
      id: "mehendi",
      name: "Ganesh Sthapana & Mehendi",
      date: "17 December 2026",
      time: "03:00 PM",
      venue: "Courtyard of Palms",
      attire: "Vibrant Greens & Florals"
    },
    {
      id: "sangeet",
      name: "Sangeet & Musical Night",
      date: "17 December 2026",
      time: "07:30 PM",
      venue: "The Grand Chateau Ballroom",
      attire: "Glamorous Evening & Shimmer"
    },
    {
      id: "haldi",
      name: "Haldi & Phoolon Ki Holi",
      date: "18 December 2026",
      time: "10:30 AM",
      venue: "Poolside Lawn",
      attire: "Sunny Yellows & Pastels"
    },
    {
      id: "baraat",
      name: "Royal Baraat & Varmala",
      date: "18 December 2026",
      time: "05:30 PM",
      venue: "The Grand Royal Arch",
      attire: "Royal & Traditional"
    },
    {
      id: "wedding",
      name: "Wedding Ceremony (Pheras)",
      date: "18 December 2026",
      time: "07:30 PM",
      venue: "Mandap by the Lotus Pond",
      attire: "Traditional Luxury"
    },
    {
      id: "reception",
      name: "Reception & Grand Dinner",
      date: "18 December 2026",
      time: "09:30 PM",
      venue: "Royal Banquet Grounds",
      attire: "Formal Luxury / Royal Ethnic"
    }
  ],
  rsvpForm: {
    title: "Confirm Your Attendance",
    subtitle: "We can't wait to celebrate together! Please let us know if you'll be joining us.",
    fields: [
      { key: "guestName", label: "Full Name", placeholder: "Your Name", type: "text", required: true },
      { key: "mobileNumber", label: "Phone / WhatsApp Number", placeholder: "+91 98765 43210", type: "tel", required: true },
      { key: "attendance", label: "Will you attend?", type: "select", options: ["Joyfully Accept (Yes! 🎉)", "Regretfully Decline"], required: true },
      { key: "familyGuestCount", label: "Number of Guests", placeholder: "1", type: "number", min: 1, max: 10, required: true },
      { key: "eventsAttending", label: "Functions you'll attend", type: "text", placeholder: "All Functions / Sangeet & Wedding" },
      { key: "message", label: "Blessings / Message for Isha & Sagar", placeholder: "Write your blessings for the couple...", type: "textarea", required: false }
    ],
    submit: "Submit RSVP",
    submitWhatsapp: "Send RSVP via WhatsApp 📲",
    close: "Close",
    closeSymbol: "✕",
    successTitle: "Thank You So Much!",
    successMessage: "Your RSVP response for Isha & Sagar's wedding has been recorded with love. We look forward to welcoming you!",
    done: "Close"
  },
  assets: {
    introVideo: "assets/1.mp4",
    waxSeal: "assets/images/wax-seal.webp",
    envelopeTop: "assets/images/envelope-top.webp",
    envelopeLeft: "assets/images/envelope-left.webp",
    envelopeRight: "assets/images/envelope-right.webp",
    envelopeBottom: "assets/images/envelope-bottom.webp",
    tornEdge: "assets/images/torn-edge.svg",
    venueImage: "assets/images/venue-sketch.svg",
    dressPhotoOne: "assets/images/dress-photo-one.svg",
    dressPhotoTwo: "assets/images/dress-photo-two.svg",
    footerPhoto: "assets/images/footer-photo.svg",
    flowerOrnament: "assets/images/flower.svg"
  }
};
