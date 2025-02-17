// filepath: fix-imports.js
const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      return;
    }

    const updatedData = data.replace(/\.default/g, '');

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file: ${filePath}`, err);
      } else {
        console.log(`Fixed imports in: ${filePath}`);
      }
    });
  });
}

const jsFilePath = path.join(__dirname, 'src', 'server.js'); // Adjust path if necessary
fixImports(jsFilePath);