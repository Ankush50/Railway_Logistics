const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Base SVG icon content (simple train icon)
const BASE_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#1e40af"/>
  
  <!-- Train body -->
  <rect x="96" y="160" width="320" height="200" rx="20" fill="white"/>
  
  <!-- Train windows -->
  <rect x="120" y="180" width="80" height="60" rx="10" fill="#e0e7ff"/>
  <rect x="220" y="180" width="80" height="60" rx="10" fill="#e0e7ff"/>
  <rect x="320" y="180" width="80" height="60" rx="10" fill="#e0e7ff"/>
  
  <!-- Train wheels -->
  <circle cx="160" cy="380" r="25" fill="#374151"/>
  <circle cx="352" cy="380" r="25" fill="#374151"/>
  
  <!-- Train details -->
  <rect x="96" y="140" width="320" height="20" rx="10" fill="#fbbf24"/>
  <rect x="120" y="260" width="80" height="40" rx="8" fill="#10b981"/>
  <rect x="220" y="260" width="80" height="40" rx="8" fill="#10b981"/>
  <rect x="320" y="260" width="80" height="40" rx="8" fill="#10b981"/>
  
  <!-- Train light -->
  <circle cx="416" y="200" r="15" fill="#fbbf24"/>
  
  <!-- Smoke -->
  <circle cx="96" y="120" r="8" fill="#9ca3af" opacity="0.6"/>
  <circle cx="110" y="110" r="6" fill="#9ca3af" opacity="0.4"/>
  <circle cx="120" y="100" r="4" fill="#9ca3af" opacity="0.2"/>
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
console.log('Generating PWA icons...');

ICON_SIZES.forEach(size => {
  const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
  
  // For now, we'll create placeholder files since we can't generate actual PNGs
  // In a real scenario, you'd use a library like sharp or canvas to generate PNGs
  const placeholderContent = `# Placeholder for icon-${size}x${size}.png
# This should be a ${size}x${size} PNG icon
# You can use online tools or design software to create the actual icon
# Recommended: Use the SVG above as a base and export to PNG at ${size}x${size} resolution`;
  
  fs.writeFileSync(iconPath, placeholderContent);
  console.log(`Created ${iconPath}`);
});

// Create the SVG base icon
const svgPath = path.join(publicDir, 'icon.svg');
fs.writeFileSync(svgPath, BASE_SVG);
console.log(`Created ${svgPath}`);

console.log('\nIcon generation complete!');
console.log('\nNote: These are placeholder files. To create actual PNG icons:');
console.log('1. Use the generated icon.svg as a base');
console.log('2. Open it in a design tool (Figma, Sketch, etc.)');
console.log('3. Export to PNG at each required size');
console.log('4. Replace the placeholder files with actual PNGs');
console.log('\nOr use online tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('- https://favicon.io/');
