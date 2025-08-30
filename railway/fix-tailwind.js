const fs = require('fs');
const path = require('path');

console.log('Fixing Tailwind CSS setup...');

// Update package.json to use correct Tailwind v3 dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove Tailwind v4 dependencies and add v3
delete packageJson.devDependencies['@tailwindcss/postcss'];
packageJson.devDependencies.tailwindcss = '^3.4.0';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Package.json updated successfully!');
console.log('Please run: npm install');
console.log('Then run: npm run dev');
