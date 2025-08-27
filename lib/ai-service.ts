import OpenAI from 'openai'
import { storageService } from './storage-service'
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

type SupabaseClient = ReturnType<typeof createClient<Database>>

interface OnboardingData {
  step_1?: {
    user_type: string
  }
  step_2?: {
    planning_stage: string
    wedding_location: string
  }
  step_3?: {
    partner1_name: string
    partner2_name: string
    wedding_date: string
    currency: string
    budget: number
  }
  step_4?: {
    guest_count: number
    international_guests: string
    requirements?: string[]
    guests_notes?: string
    special_requirements_notes?: string  // Free text from user
  }
  step_5?: {
    themes: string | string[]  // Can be array or single theme
    color_palette: string
    inspiration_refs?: string
    inspiration?: string  // Free text inspiration from user
  }
  step_6?: {
    ceremony_type: string
    religion?: string
    traditions?: string
    special_elements?: string
    experiences?: string[]  // Array of selected experiences
    other_experience?: string  // Custom experience description
    special_wishes?: string  // Free text special wishes from user
  }
}

interface MoodboardGenerationResult {
  success: boolean
  data?: {
    image_url: string
    stored_image_url?: string
    stored_image_path?: string
    wedding_summary: string
    ai_insights: string[]
    style_guide: {
      color_palette: string
      style_keywords: string[]
      themes: string[]
    }
    generation_metadata: {
      prompt_used: string
      model: string
      generated_at: string
      fallback_reason?: string
    }
  }
  error?: string
}

class AIService {
  private openai: OpenAI | null

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not configured - moodboard generation will use fallback mode')
      this.openai = null
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Normalizes the actual onboarding data structure to match expected AI interface
   */
  private normalizeOnboardingData(rawData: any): OnboardingData {
    if (!rawData) return {}
    
    const normalized: OnboardingData = {}
    
    // Step 1: User type (usually fine as is)
    if (rawData.step_1) {
      normalized.step_1 = {
        user_type: rawData.step_1.user_type === 'couples' ? 'couple' : rawData.step_1.user_type
      }
    }
    
    // Step 2: Wedding stage and location (already correct format)
    if (rawData.step_2) {
      normalized.step_2 = {
        planning_stage: rawData.step_2.planning_stage,
        wedding_location: rawData.step_2.wedding_location
      }
    }
    
    // Step 3: Couple details (fix camelCase to snake_case)
    if (rawData.step_3) {
      normalized.step_3 = {
        partner1_name: rawData.step_3.partner1Name,
        partner2_name: rawData.step_3.partner2Name,
        wedding_date: rawData.step_3.weddingDate,
        currency: rawData.step_3.currency,
        budget: rawData.step_3.budgetValue
      }
    }
    
    // Step 4: Guest info (fix field names)  
    if (rawData.step_4) {
      normalized.step_4 = {
        guest_count: rawData.step_4.guestCount || rawData.step_4.guest_count,
        international_guests: rawData.step_4.internationalGuests || rawData.step_4.international_guests,
        requirements: rawData.step_4.specialRequirements || rawData.step_4.requirements,
        guests_notes: rawData.step_4.notes || rawData.step_4.guests_notes,
        // Include special requirements notes text
        special_requirements_notes: rawData.step_4.specialRequirements?.otherNotes || ''
      }
    }
    
    // Step 5: Style preferences (fix colorPalette to color_palette)
    if (rawData.step_5) {
      normalized.step_5 = {
        themes: rawData.step_5.themes,
        color_palette: rawData.step_5.colorPalette || rawData.step_5.color_palette,
        inspiration_refs: rawData.step_5.inspirationRefs || rawData.step_5.inspiration_refs,
        // Include free text inspiration field
        inspiration: rawData.step_5.inspiration || ''
      }
    }
    
    // Step 6: Ceremony and experiences (fix ceremonyType to ceremony_type)
    if (rawData.step_6) {
      normalized.step_6 = {
        ceremony_type: rawData.step_6.ceremonyType || rawData.step_6.ceremony_type,
        religion: rawData.step_6.religiousType || rawData.step_6.religion,
        traditions: rawData.step_6.traditions,
        special_elements: rawData.step_6.specialWishes || rawData.step_6.special_elements,
        // Include experiences array
        experiences: rawData.step_6.experiences || [],
        other_experience: rawData.step_6.otherExperience || '',
        // Free text special wishes
        special_wishes: rawData.step_6.specialWishes || ''
      }
    }
    
    return normalized
  }

  /**
   * Extracts key wedding characteristics from onboarding data
   */
  private extractWeddingCharacteristics(data: OnboardingData): string {
    const characteristics = []

    // Couple info
    if (data.step_3?.partner1_name && data.step_3?.partner2_name) {
      characteristics.push(`Couple: ${data.step_3.partner1_name} & ${data.step_3.partner2_name}`)
    }

    // Location and planning stage
    if (data.step_2?.wedding_location) {
      characteristics.push(`Location: ${data.step_2.wedding_location}`)
    }

    if (data.step_2?.planning_stage) {
      characteristics.push(`Planning stage: ${data.step_2.planning_stage}`)
    }

    // Wedding date
    if (data.step_3?.wedding_date) {
      characteristics.push(`Date: ${data.step_3.wedding_date}`)
    }

    // Guest count and scale
    if (data.step_4?.guest_count) {
      const scale = data.step_4.guest_count > 100 ? 'large' : data.step_4.guest_count > 50 ? 'medium' : 'intimate'
      characteristics.push(`Scale: ${scale} (${data.step_4.guest_count} guests)`)
    }

    // International guests
    if (data.step_4?.international_guests) {
      characteristics.push(`International guests: ${data.step_4.international_guests}`)
    }

    // Special guest requirements notes
    if (data.step_4?.special_requirements_notes?.trim()) {
      characteristics.push(`Guest requirements: ${data.step_4.special_requirements_notes}`)
    }

    // Budget level
    if (data.step_3?.budget && data.step_3?.currency) {
      const budgetLevel = data.step_3.budget > 50000 ? 'luxury' : data.step_3.budget > 25000 ? 'elegant' : 'charming'
      characteristics.push(`Budget level: ${budgetLevel} (${data.step_3.currency} ${data.step_3.budget.toLocaleString()})`)
    }

    // Style and themes
    if (data.step_5?.themes) {
      const themesArray = Array.isArray(data.step_5.themes) ? data.step_5.themes : [data.step_5.themes]
      characteristics.push(`Style: ${themesArray.join(', ')}`)
    }
    
    if (data.step_5?.color_palette) {
      characteristics.push(`Colors: ${data.step_5.color_palette}`)
    }

    // Style inspiration (free text from user)
    if (data.step_5?.inspiration?.trim()) {
      characteristics.push(`Style inspiration: "${data.step_5.inspiration}"`)
    }

    // Ceremony type and religion
    if (data.step_6?.ceremony_type) {
      characteristics.push(`Ceremony: ${data.step_6.ceremony_type}`)
      if (data.step_6.religion) {
        characteristics.push(`Religious: ${data.step_6.religion}`)
      }
    }

    // Experiences and traditions
    if (data.step_6?.experiences && data.step_6.experiences.length > 0) {
      characteristics.push(`Experiences: ${data.step_6.experiences.join(', ')}`)
    }

    if (data.step_6?.other_experience?.trim()) {
      characteristics.push(`Special experience: ${data.step_6.other_experience}`)
    }

    // Special wishes (free text from user)
    if (data.step_6?.special_wishes?.trim()) {
      characteristics.push(`Special wishes: "${data.step_6.special_wishes}"`)
    }

    // Any other inspiration references
    if (data.step_5?.inspiration_refs?.trim()) {
      characteristics.push(`Additional inspiration: ${data.step_5.inspiration_refs}`)
    }

    return characteristics.join(', ')
  }

  /**
   * Generates a DALL-E prompt for wedding moodboard
   */
  private generateDALLEPrompt(onboardingData: OnboardingData): string {
    const characteristics = this.extractWeddingCharacteristics(onboardingData)
    
    const basePrompt = "Create a wedding moodboard with 4 distinct sections in a 2x2 grid layout. Each section should showcase different aspects of the wedding:"
    
    const sections = [
      "Top-left: Ceremony setting and decor",
      "Top-right: Color palette and floral arrangements", 
      "Bottom-left: Reception atmosphere and table settings",
      "Bottom-right: Wedding cake and dessert styling"
    ]

    const styleRequirements = [
      "Professional photography style",
      "High-end wedding magazine aesthetic",
      "Cohesive color scheme throughout",
      "Elegant typography for any text elements",
      "Clean, modern layout with subtle borders between sections"
    ]

    return `${basePrompt}

${sections.join('\n')}

Wedding characteristics: ${characteristics}

Style requirements:
${styleRequirements.join('\n')}

The overall mood should be romantic, elegant, and aspirational, capturing the unique vision for this couple's special day.`
  }

  /**
   * Generates wedding summary and insights using GPT
   */
  private async generateWeddingInsights(onboardingData: OnboardingData): Promise<{
    summary: string
    insights: string[]
    styleGuide: {
      color_palette: string
      style_keywords: string[]
      themes: string[]
    }
  }> {
    const characteristics = this.extractWeddingCharacteristics(onboardingData)
    const names = `${onboardingData.step_3?.partner1_name || 'Partner 1'} & ${onboardingData.step_3?.partner2_name || 'Partner 2'}`
    
    // If OpenAI is not available, return fallback immediately
    if (!this.openai) {
      console.log('Using fallback insights (OpenAI not configured)')
      return this.getFallbackInsights(onboardingData, names)
    }

    const prompt = `You are a professional wedding planner creating a personalized wedding vision summary.

Wedding details:
${characteristics}
Couple: ${names}
${onboardingData.step_3?.wedding_date ? `Date: ${onboardingData.step_3.wedding_date}` : 'Date: To be determined'}

Please provide:
1. A beautiful, personalized wedding summary paragraph (2-3 sentences) that captures their unique vision
2. 4 specific, actionable insights or recommendations based on their choices
3. A style guide with color palette, style keywords, and themes

Format your response as JSON:
{
  "summary": "Beautiful paragraph about their wedding vision...",
  "insights": [
    "Insight 1...",
    "Insight 2...",
    "Insight 3...",
    "Insight 4..."
  ],
  "styleGuide": {
    "color_palette": "Main colors with descriptions",
    "style_keywords": ["keyword1", "keyword2", "keyword3"],
    "themes": ["theme1", "theme2"]
  }
}`

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are a professional wedding planner with expertise in creating personalized wedding visions. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from GPT')
      }

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating wedding insights:', error)
      return this.getFallbackInsights(onboardingData, names)
    }
  }

  /**
   * Fallback insights when OpenAI is not available
   */
  private getFallbackInsights(onboardingData: OnboardingData, names: string) {
    const themesData = onboardingData.step_5?.themes
    const themesString = Array.isArray(themesData) ? themesData.join(' ') : (themesData || 'classic')
    
    return {
      summary: `${names} have envisioned a beautiful ${themesString.toLowerCase()} wedding celebration that perfectly reflects their unique love story and personal style preferences.`,
      insights: [
        "Consider creating a detailed timeline to ensure your day flows smoothly",
        "Book your photographer early to capture your special moments beautifully", 
        "Plan thoughtful guest experiences that reflect your personal style",
        "Focus on meaningful details that tell your unique love story"
      ],
      styleGuide: {
        color_palette: onboardingData.step_5?.color_palette || "Classic and elegant color scheme",
        style_keywords: themesString ? [themesString.split(' ')[0].toLowerCase(), "elegant", "romantic"] : ["classic", "elegant", "romantic"],
        themes: [themesString.split(' ')[0] || "classic", "romantic"]
      }
    }
  }

  /**
   * Generates fallback moodboard with curated images
   */
  private generateFallbackMoodboard(rawOnboardingData: any): MoodboardGenerationResult {
    // Normalize the data first
    const onboardingData = this.normalizeOnboardingData(rawOnboardingData)
    const fallbackImages = [
      '/images/home/moodboard/wedding-1.webp',
      '/images/home/moodboard/wedding-2.webp', 
      '/images/home/moodboard/wedding-3.webp',
      '/images/home/moodboard/wedding-4.webp',
      '/images/home/moodboard/wedding-5.webp'
    ]

    // Select image based on style preferences
    let selectedImage = fallbackImages[0] // default
    const themesData = onboardingData.step_5?.themes
    const themesString = Array.isArray(themesData) ? themesData.join(' ').toLowerCase() : (themesData?.toLowerCase() || '')
    
    if (themesString.includes('modern') || themesString.includes('minimalist')) {
      selectedImage = fallbackImages[1]
    } else if (themesString.includes('rustic') || themesString.includes('bohemian')) {
      selectedImage = fallbackImages[2]
    } else if (themesString.includes('classic') || themesString.includes('elegant')) {
      selectedImage = fallbackImages[3]
    } else if (themesString.includes('romantic') || themesString.includes('garden')) {
      selectedImage = fallbackImages[4]
    }

    const names = `${onboardingData.step_3?.partner1_name || 'Partner 1'} & ${onboardingData.step_3?.partner2_name || 'Partner 2'}`
    
    return {
      success: true,
      data: {
        image_url: selectedImage,
        wedding_summary: `${names} have chosen a beautiful ${themesString || 'classic'} wedding theme that perfectly reflects their unique love story and personal style.`,
        ai_insights: [
          "Consider creating a mood board with your chosen color palette",
          "Book your photographer early to capture your special moments",
          "Plan a timeline that allows for meaningful moments throughout the day",
          "Don't forget the small details that make your wedding uniquely yours"
        ],
        style_guide: {
          color_palette: onboardingData.step_5?.color_palette || "Classic and elegant color scheme",
          style_keywords: themesString ? [themesString.split(' ')[0], "elegant", "timeless"] : ["classic", "elegant", "timeless"],
          themes: [themesString.split(' ')[0] || "classic", "romantic"]
        },
        generation_metadata: {
          prompt_used: "fallback-curated-image",
          model: "fallback",
          generated_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Generates a complete moodboard using AI with optional storage
   */
  async generateMoodboard(
    rawOnboardingData: any, 
    workspaceId?: string,
    supabase?: SupabaseClient
  ): Promise<MoodboardGenerationResult> {
    try {
      // Normalize the data structure first
      const onboardingData = this.normalizeOnboardingData(rawOnboardingData)
      
      // Generate insights first (faster and more reliable)
      const insightsPromise = this.generateWeddingInsights(onboardingData)

      // Generate DALL-E prompt
      const dallePrompt = this.generateDALLEPrompt(onboardingData)
      
      let imageUrl: string
      let generationModel = "dall-e-3"

      try {
        // Check if OpenAI is available
        if (!this.openai) {
          throw new Error('OpenAI not configured - using fallback images')
        }

        // Attempt DALL-E generation with timeout
        const imageResponse = await Promise.race([
          this.openai.images.generate({
            model: "dall-e-3",
            prompt: dallePrompt,
            size: "1024x1024",
            quality: "standard",
            n: 1,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DALL-E generation timeout')), 30000)
          )
        ]) as any

        if (!imageResponse.data[0]?.url) {
          throw new Error('No image URL returned from DALL-E')
        }
        
        imageUrl = imageResponse.data[0].url
      } catch (imageError) {
        console.warn('DALL-E generation failed, using fallback:', imageError)
        
        // Use fallback image generation
        const fallback = this.generateFallbackMoodboard(rawOnboardingData)
        if (fallback.success && fallback.data) {
          const insights = await insightsPromise
          return {
            success: true,
            data: {
              ...fallback.data,
              wedding_summary: insights.summary,
              ai_insights: insights.insights,
              style_guide: insights.styleGuide,
              generation_metadata: {
                ...fallback.data.generation_metadata,
                fallback_reason: imageError instanceof Error ? imageError.message : 'Unknown error'
              }
            }
          }
        }
        throw imageError
      }

      // Wait for insights to complete
      const insights = await insightsPromise

      // Store image if workspaceId is provided
      let storedImageUrl: string | undefined
      let storedImagePath: string | undefined
      
      if (workspaceId && imageUrl.startsWith('https://') && supabase) {
        try {
          const storageResult = await storageService.saveMoodboardImage(
            supabase,
            imageUrl, 
            workspaceId, 
            { type: 'main' }
          )
          
          if (storageResult.success) {
            storedImageUrl = storageResult.url
            storedImagePath = storageResult.path
          }
        } catch (storageError) {
          console.warn('Failed to store image, continuing with original URL:', storageError)
        }
      }

      return {
        success: true,
        data: {
          image_url: storedImageUrl || imageUrl,
          stored_image_url: storedImageUrl,
          stored_image_path: storedImagePath,
          wedding_summary: insights.summary,
          ai_insights: insights.insights,
          style_guide: insights.styleGuide,
          generation_metadata: {
            prompt_used: dallePrompt,
            model: generationModel,
            generated_at: new Date().toISOString()
          }
        }
      }
    } catch (error) {
      console.error('Error generating moodboard:', error)
      
      // Ultimate fallback
      return this.generateFallbackMoodboard(rawOnboardingData)
    }
  }

  /**
   * Regenerates a specific aspect of the moodboard
   */
  async regenerateImage(
    rawOnboardingData: any, 
    focusArea: 'ceremony' | 'colors' | 'reception' | 'desserts'
  ): Promise<{ success: boolean; image_url?: string; error?: string }> {
    try {
      // Check if OpenAI is available
      if (!this.openai) {
        return {
          success: false,
          error: 'AI image generation is not available. Please use the curated moodboard instead.'
        }
      }

      // Normalize the data structure first
      const onboardingData = this.normalizeOnboardingData(rawOnboardingData)
      const characteristics = this.extractWeddingCharacteristics(onboardingData)
      
      const focusPrompts = {
        ceremony: `Wedding ceremony setting with ${characteristics}. Focus on the altar, seating, and ceremonial decorations. Professional wedding photography style, elegant and romantic.`,
        colors: `Wedding color palette and floral arrangements with ${characteristics}. Focus on color harmony, flower choices, and decorative elements. Magazine-quality styling.`,
        reception: `Wedding reception atmosphere and table settings with ${characteristics}. Focus on dining setup, centerpieces, and ambient lighting. Luxury event styling.`,
        desserts: `Wedding cake and dessert styling with ${characteristics}. Focus on cake design, dessert table, and sweet treats presentation. High-end bakery aesthetic.`
      }

      const imageResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: focusPrompts[focusArea],
        size: "1024x1024",
        quality: "standard",
        n: 1,
      })

      if (!imageResponse.data?.[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }
      
      const imageUrl = imageResponse.data[0].url

      return {
        success: true,
        image_url: imageUrl
      }
    } catch (error) {
      console.error('Error regenerating image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Singleton instance
export const aiService = new AIService()

// Type exports
export type { OnboardingData, MoodboardGenerationResult }