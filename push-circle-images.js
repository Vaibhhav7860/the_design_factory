import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs/promises';
import path from 'path';
import { connectToDatabase } from './src/lib/db/mongoose.js';
import { Category } from './src/lib/db/models/Category.js';
import { saveUpload } from './src/lib/storage/index.js';

function getSimilarity(subTitle, fileName) {
  const baseName = fileName.replace(/\.png$/i, '');
  
  const n1 = subTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n1 === n2) return 100;
  
  // Remove " (2)" for token matching
  const cleanBase = baseName.replace(/\(\d+\)/g, '');
  
  const t1 = subTitle.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const t2 = cleanBase.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  let matches = 0;
  for (const token of t1) {
    // If exact match or close match (e.g. stationary vs stationery)
    if (t2.includes(token) || t2.some(x => x.length >= 4 && token.length >= 4 && (x.startsWith(token.slice(0, 4)) || token.startsWith(x.slice(0, 4))))) {
      matches++;
    }
  }
  return matches / Math.max(t1.length, t2.length);
}

async function run() {
  try {
    await connectToDatabase();
    
    const circlesDir = path.resolve('Circles (1)');
    const files = await fs.readdir(circlesDir);
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));
    
    console.log(`Found ${pngFiles.length} PNG files in Circles (1) directory.`);
    
    const categories = await Category.find({});
    
    for (const cat of categories) {
      if (!cat.subcategories || cat.subcategories.length === 0) continue;
      
      let modified = false;
      
      for (const sub of cat.subcategories) {
        let bestFile = null;
        let bestScore = -1;
        
        for (const file of pngFiles) {
          const score = getSimilarity(sub.title, file);
          const isDuplicate = /\(\d+\)/.test(file);
          
          if (score > bestScore) {
            bestScore = score;
            bestFile = file;
          } else if (score === bestScore && score > 0) {
            // Tie breaker: prefer non-duplicate
            if (/\(\d+\)/.test(bestFile) && !isDuplicate) {
              bestFile = file;
            }
          }
        }
        
        if (bestFile && bestScore >= 0.4) {
          console.log(`Matched subcategory "${sub.title}" -> "${bestFile}" (score: ${bestScore})`);
          
          const filePath = path.join(circlesDir, bestFile);
          const buffer = await fs.readFile(filePath);
          
          // Upload to R2
          const result = await saveUpload({
            buffer,
            mime: 'image/png',
            originalName: bestFile,
            folder: 'circles'
          });
          
          if (sub.circleImage !== result.url) {
             sub.circleImage = result.url;
             modified = true;
             console.log(`  Uploaded! URL: ${result.url}`);
          } else {
             console.log(`  Already using this URL: ${result.url}`);
          }
        } else {
          console.log(`No good match found for subcategory "${sub.title}"`);
        }
      }
      
      if (modified) {
        cat.markModified('subcategories');
        await cat.save();
        console.log(`Saved category ${cat.title}`);
      }
    }
    
    console.log('All done!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
