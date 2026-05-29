const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'CompaniesView.tsx');
const code = fs.readFileSync(filePath, 'utf8');

// Let's find lines around 610 to 795
const lines = code.split('\n');
console.log("Segmented lines around map and closes:");
for (let i = 770; i <= 800; i++) {
  if (lines[i - 1] !== undefined) {
    console.log(`${i}: ${lines[i - 1]}`);
  }
}
