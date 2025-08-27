#!/usr/bin/env node

/**
 * Script d'optimisation des images pour le développement
 * Réduit les images de 30MB à ~5MB sans perte de qualité visible
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'public/images/home/moodboard');
const OUTPUT_DIR = path.join(INPUT_DIR, 'optimized');

async function optimizeImages() {
  console.log('🖼️  Optimisation des images en cours...');
  
  const files = fs.readdirSync(INPUT_DIR).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  let totalSizeBefore = 0;
  let totalSizeAfter = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.jpg', '.webp'));
    
    // Taille avant
    const statsBefore = fs.statSync(inputPath);
    totalSizeBefore += statsBefore.size;
    
    // Optimisation avec Sharp
    await sharp(inputPath)
      .resize(800, 1000, { // Format 4:5 optimisé pour web
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 80, // Qualité optimale pour web
        effort: 6    // Compression maximale
      })
      .toFile(outputPath);
    
    // Taille après
    const statsAfter = fs.statSync(outputPath);
    totalSizeAfter += statsAfter.size;
    
    console.log(`✅ ${file}: ${(statsBefore.size / 1024 / 1024).toFixed(1)}MB → ${(statsAfter.size / 1024 / 1024).toFixed(1)}MB`);
  }

  const compressionRatio = ((totalSizeBefore - totalSizeAfter) / totalSizeBefore * 100).toFixed(1);
  
  console.log(`\n🎉 Optimisation terminée !`);
  console.log(`📉 Réduction totale: ${(totalSizeBefore / 1024 / 1024).toFixed(1)}MB → ${(totalSizeAfter / 1024 / 1024).toFixed(1)}MB (-${compressionRatio}%)`);
  console.log(`💡 Pour utiliser les images optimisées, modifie les imports vers /optimized/`);
}

optimizeImages().catch(console.error);