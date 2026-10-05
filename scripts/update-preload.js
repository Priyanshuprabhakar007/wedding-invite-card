const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const oldPreloadBlock = `  function preloadCriticalAssets() {
    var criticalUrls = [
      "assets/images/envelope-flap-ornate.png",
      "assets/images/corner-ornament.png",
      "assets/images/envelope-seal.png",
      "assets/images/invite-card-bg.png",
      "assets/images/invite-input-pill.png",
      "assets/images/invite-btn-pill.png",
      "assets/images/hero-burgundy-bg.png",
      "assets/images/branch-gold.png",
      "assets/images/branch-ivory.png",
      "assets/images/peony-red.jpg",
      "assets/images/rose-ivory.jpg",
      "assets/images/ganesh-hero.png",
      "assets/images/mehendi.png",
      "assets/images/marriage.png",
      "assets/images/reception.png"
    ];

    criticalUrls.forEach(function (url) {
      var img = new Image();
      img.src = url;
      if (typeof img.decode === "function") {
        img.decode().catch(function () {});
      }
    });
  }`;

const newPreloadBlock = `  function preloadCriticalAssets() {
    var criticalUrls = [
      "assets/images/envelope-seal.webp",
      "assets/images/envelope-flap-ornate.webp",
      "assets/images/corner-ornament.webp"
    ];

    criticalUrls.forEach(function (url) {
      var img = new Image();
      img.src = url;
      if (typeof img.decode === "function") {
        img.decode().catch(function () {});
      }
    });
  }`;

// Use regex or normalized replace
code = code.replace(/function preloadCriticalAssets\(\)\s*\{[\s\S]*?criticalUrls\.forEach[\s\S]*?\}\);?\s*\}/, newPreloadBlock);

fs.writeFileSync('script.js', code, 'utf8');
console.log('script.js preloadCriticalAssets updated!');
