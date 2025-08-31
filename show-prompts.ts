#!/usr/bin/env tsx

/**
 * Script pour visualiser les prompts générés par le système moodboard
 * Usage: tsx show-prompts.ts [seed]
 */

import { buildScene } from './lib/moodboard-randomizer'
import { generateBatchPrompts } from './lib/moodboard-prompts'
import type { OnboardingData } from './lib/ai-service'

// Données de test
const mockOnboardingData: OnboardingData = {
  step_2: {
    planning_stage: 'early',
    wedding_location: 'Paris, France'
  },
  step_3: {
    partner1_name: 'Alice',
    partner2_name: 'Bob',
    wedding_date: '2024-06-15',
    currency: 'USD',
    budget: 35000
  },
  step_4: {
    guest_count: 80,
    international_guests: 'some'
  },
  step_5: {
    themes: ['romantic', 'classic'],
    color_palette: 'blush pink and gold'
  },
  step_6: {
    ceremony_type: 'traditional',
    experiences: ['cocktail-hour']
  }
}

function showPrompts(seed?: number) {
  console.log('🎨 GÉNÉRATEUR DE PROMPTS MOODBOARD\n')
  
  const usedSeed = seed || Math.floor(Math.random() * 100000)
  console.log(`🎲 Seed utilisé: ${usedSeed}\n`)
  
  // Génération de la scène
  const result = buildScene(mockOnboardingData, usedSeed)
  
  console.log('📋 CONFIGURATION GÉNÉRÉE:')
  console.log(`   Catégories: ${result.metadata.categoriesSelected.join(', ')}`)
  console.log(`   Palette couleurs: ${result.colorPalette}`)
  console.log(`   Éléments sélectionnés: ${result.metadata.elementsSelected}`)
  console.log(`   Temps de génération: ${result.metadata.generationTime}ms\n`)
  
  // Génération des prompts
  const prompts = generateBatchPrompts(result.photos)
  
  prompts.forEach((prompt, index) => {
    const photo = result.photos[index]
    
    console.log(`📸 PHOTO ${index + 1} - ${photo.category.toUpperCase()}`)
    console.log('─'.repeat(60))
    console.log(`Sous-type: ${photo.subType}`)
    console.log(`Environnement: ${photo.environment}`)
    console.log(`Moment: ${photo.time}`)
    
    const elements = Object.entries(photo.elements)
      .filter(([key, value]) => !key.endsWith('Subtle') && value)
      .map(([key, value]) => `${key}: ${value}`)
    if (elements.length > 0) {
      console.log(`Éléments: ${elements.join(', ')}`)
    }
    
    const helpers = Object.entries(photo.helpers)
      .map(([key, value]) => `${key}: ${value}`)
    if (helpers.length > 0) {
      console.log(`Helpers: ${helpers.join(', ')}`)
    }
    
    console.log('\n🔤 PROMPT DALL-E:')
    console.log('┌' + '─'.repeat(58) + '┐')
    
    // Divise le prompt en lignes de maximum 56 caractères
    const words = prompt.prompt.split(' ')
    let lines = ['']
    let currentLine = 0
    
    for (const word of words) {
      if ((lines[currentLine] + word).length > 56) {
        lines.push('')
        currentLine++
      }
      lines[currentLine] += (lines[currentLine] ? ' ' : '') + word
    }
    
    lines.forEach(line => {
      console.log(`│ ${line.padEnd(56)} │`)
    })
    
    console.log('└' + '─'.repeat(58) + '┘')
    
    console.log(`\n📊 Métadonnées:`)
    console.log(`   Éléments inclus: ${prompt.metadata.elementsIncluded.join(', ') || 'aucun'}`)
    console.log(`   Tokens qualité: ${prompt.metadata.qualityTokens.join(', ')}`)
    console.log(`   Amélioration location: ${prompt.metadata.locationEnhanced ? 'Oui' : 'Non'}`)
    
    if (index < prompts.length - 1) {
      console.log('\n' + '═'.repeat(60) + '\n')
    }
  })
  
  console.log('\n✨ Pour tester avec un seed différent:')
  console.log(`   tsx show-prompts.ts ${Math.floor(Math.random() * 100000)}`)
}

// Récupère le seed depuis les arguments de ligne de commande
const seedArg = process.argv[2]
const seed = seedArg ? parseInt(seedArg) : undefined

if (seedArg && isNaN(seed!)) {
  console.error('❌ Le seed doit être un nombre')
  process.exit(1)
}

showPrompts(seed)