const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const target = `  function preloadCriticalAssets() {
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

code = code.replace(/function preloadCriticalAssets\(\)[\s\S]*?function setupUnifiedInvitationExperience/, target + '\n\n  function setupUnifiedInvitationExperience');

fs.writeFileSync('script.js', code, 'utf8');
console.log('Fixed preloadCriticalAssets syntax successfully!');
