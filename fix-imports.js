// filepath: fix-imports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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


function appendJsExtension(filePath) {
  try{
    const data = fs.readFileSync(filePath, 'utf8');
    const updatedData = data.replace('./services/getSheets', './services/getSheets.js').replace('./services/getJobs', './services/getJobs.js').replace("../assets/jobs","../assets/jobs.js");
    fs.writeFileSync(filePath, updatedData, 'utf8');
    console.log(`Appended .js extension to: ${filePath}`);
  } catch (err) {
    console.error(`Error appending .js extension to: ${filePath}`, err);
  }
  
}

const indexPath = path.join(__dirname, 'src', 'index.js');
const getJobsPath = path.join(__dirname, 'src','services', 'getJobs.js');

fixImports(indexPath);