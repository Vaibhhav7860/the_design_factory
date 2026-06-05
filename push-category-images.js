import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs/promises';
import path from 'path';
import { connectToDatabase } from './src/lib/db/mongoose.js';
import { Category } from './src/lib/db/models/Category.js';
import { saveUpload } from './src/lib/storage/index.js';

function getSimilarity(catTitle, fileName) {
  const baseName = fileName.replace(/\.(png|jpe?g)$/i, '');
  
  const n1 = catTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return 100;
  
  const t1 = catTitle.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const t2 = baseName.toLowerCase().replace(/[^a-z0-9\s_]/g, ' ').replace(/_/g, ' ').split(/\s+/).filter(Boolean);
  
  let matches = 0;
  for (const token of t1) {
    if (t2.includes(token) || t2.some(x => x.length >= 4 && token.length >= 4 && (x.startsWith(token.slice(0, 4)) || token.startsWith(x.slice(0, 4))))) {
      matches++;
    }
  }
  return matches / Math.max(t1.length, t2.length);
}

async function run() {
  try {
    await connectToDatabase();
    
    const catDir = path.resolve('category_images');
    const files = await fs.readdir(catDir);
    const validFiles = files.filter(f => f.match(/\.(png|jpe?g)$/i));
    
    console.log(`Found ${validFiles.length} images in category_images directory.`);
    
    const categories = await Category.find({});
    
    for (const cat of categories) {
      let bestFile = null;
      let bestScore = -1;
      
      for (const file of validFiles) {
        const score = getSimilarity(cat.title, file);
        if (score > bestScore) {
          bestScore = score;
          bestFile = file;
        }
      }
      
      if (bestFile && bestScore >= 0.4) {
        console.log(`Matched category "${cat.title}" -> "${bestFile}" (score: ${bestScore})`);
        
        const filePath = path.join(catDir, bestFile);
        const buffer = await fs.readFile(filePath);
        
        // Upload to R2
        const result = await saveUpload({
          buffer,
          mime: bestFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
          originalName: bestFile,
          folder: 'Categories' // the user requested "Categories folder"
        });
        
        if (cat.image !== result.url) {
           cat.image = result.url;
           await cat.save();
           console.log(`  Uploaded! URL: ${result.url}`);
        } else {
           console.log(`  Already using this URL: ${result.url}`);
        }
      } else {
        console.log(`No good match found for category "${cat.title}"`);
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
