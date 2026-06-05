import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs/promises';
import path from 'path';
import { connectToDatabase } from './src/lib/db/mongoose.js';
import { Category } from './src/lib/db/models/Category.js';
import { saveUpload } from './src/lib/storage/index.js';

function getSimilarity(catTitle, subTitle, fileName) {
  const baseName = fileName.replace(/\.(png|jpe?g)$/i, '');
  const baseLower = baseName.toLowerCase();
  
  // Custom manual mappings for tricky filenames
  const manual = {
    'Labels:Rectangular Labels': 'rect',
    'Labels:Mixed Shape Labels': 'Mixed Shape',
    'Labels:Transparent Labels': 'Transparent',
    'Labels:3D Embossed Stickers': '3d embrossed stickers',
    'School Essentials:Iron On Labels For Clothes': 'Iron on',
    'Labels:Iron On Labels': 'Iron on',
    'Kids Accessories:Towel': 'Kids Towel',
    'Kids Accessories:Apron Set': 'Appron',
    'Kids Accessories:Neck Pillow Combo': 'Neck Pillow',
    'Combos:Organiser Sets': 'Personalised Organiser Sets',
    'Organisers:Organiser Sets': 'Personalised Organiser Sets',
    'Gift Stationery:Gift Stationery Sets': 'Gift Stationry set',
    'School Essentials:School Book Labels': 'School Book Lables',
    'Labels:School Book Labels': 'School Book Lables',
    'Gift Stationery:Money Envelopes': 'Money envelope kids',
    'Adults Corner:Money Envelopes': 'Money envelope adult',
    'Combos:Gift Stationery Combo - Adults': 'Gift Stationary Combo for Adults',
    'Adults Corner:Gift Stationery Combo': 'Gift Stationary Combo for Adults',
  };

  const key = `${catTitle}:${subTitle}`;
  if (manual[key] && baseLower === manual[key].toLowerCase()) {
    return 1000;
  }

  // Handle Adult vs Kids disambiguation
  const isAdultCategory = catTitle === 'Adults Corner' || subTitle.includes('Adult');
  const hasAdultInName = baseLower.includes('adult');
  
  if (isAdultCategory && !hasAdultInName && baseLower.includes(subTitle.toLowerCase())) return 0; // Skip non-adult files for adult categories if an adult one exists? Actually just penalize
  if (isAdultCategory && hasAdultInName) {
     // Boost score
  } else if (!isAdultCategory && hasAdultInName) {
     return -1; // Never match adult file to non-adult category
  }

  // Themes handling (Search by ..., earch by ..., Shop by ...)
  if (catTitle === 'Themes') {
    const themeName = subTitle.toLowerCase();
    if (baseLower.includes(themeName)) return 100;
    if (themeName === 'underwater' && baseLower.includes('under water')) return 100;
  }

  const n1 = subTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = baseLower.replace(/[^a-z0-9]/g, '');
  
  if (n1 === n2 || n2.includes(n1)) return 100 + (isAdultCategory && hasAdultInName ? 50 : 0);
  
  const t1 = subTitle.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const t2 = baseLower.replace(/[^a-z0-9\s_]/g, ' ').replace(/_/g, ' ').split(/\s+/).filter(Boolean);
  
  let matches = 0;
  for (const token of t1) {
    if (t2.includes(token) || t2.some(x => x.length >= 4 && token.length >= 4 && (x.startsWith(token.slice(0, 4)) || token.startsWith(x.slice(0, 4))))) {
      matches++;
    }
  }
  let score = matches / Math.max(t1.length, t2.length);
  if (isAdultCategory && hasAdultInName) score += 1; // Boost adult matches
  
  return score;
}

async function run() {
  try {
    await connectToDatabase();
    
    const catDir = path.resolve('subcategory_pages');
    const files = await fs.readdir(catDir);
    const validFiles = files.filter(f => f.match(/\.(png|jpe?g)$/i));
    
    console.log(`Found ${validFiles.length} images in subcategory_pages directory.`);
    
    const categories = await Category.find({});
    let updatedCount = 0;
    
    for (const cat of categories) {
      if (!cat.subcategories || cat.subcategories.length === 0) continue;
      
      let modified = false;
      
      for (const sub of cat.subcategories) {
        let bestFile = null;
        let bestScore = -1;
        
        for (const file of validFiles) {
          const score = getSimilarity(cat.title, sub.title, file);
          if (score > bestScore) {
            bestScore = score;
            bestFile = file;
          }
        }
        
        if (bestFile && bestScore >= 0.4) {
          console.log(`Matched "${cat.title} -> ${sub.title}" to "${bestFile}" (score: ${bestScore})`);
          
          const filePath = path.join(catDir, bestFile);
          const buffer = await fs.readFile(filePath);
          
          const result = await saveUpload({
            buffer,
            mime: bestFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
            originalName: bestFile,
            folder: 'subcategory_pages'
          });
          
          if (sub.image !== result.url) {
             sub.image = result.url;
             modified = true;
             console.log(`  Uploaded! URL: ${result.url}`);
          } else {
             console.log(`  Already using this URL: ${result.url}`);
          }
        } else {
          console.log(`No good match found for "${cat.title} -> ${sub.title}"`);
        }
      }
      
      if (modified) {
        cat.markModified('subcategories');
        await cat.save();
        updatedCount++;
      }
    }
    
    console.log(`All done! Updated ${updatedCount} categories.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
