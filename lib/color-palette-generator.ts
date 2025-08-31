// Generate 4-color palette from existing 2 colors for the poster

interface ColorPalette {
  hex: string
  name?: string
}

// Convert hex to HSL for color manipulation
function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const sum = max + min
  
  const l = sum / 2

  let s = 0
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum
  }

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / diff + 2) / 6; break
      case b: h = ((r - g) / diff + 4) / 6; break
    }
  }

  return [h * 360, s * 100, l * 100]
}

// Convert HSL back to hex
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Get color palette names
const COLOR_PALETTE_NAMES = [
  'Blush & Gold',
  'Classic White', 
  'Sage & Cream',
  'Navy & Rose',
  'Burgundy & Gold',
  'Dusty Blue',
  'Terracotta & Cream',
  'Lavender & Silver'
] as const

const COLOR_PALETTE_COLORS: Record<string, string[]> = {
  'Blush & Gold': ['#F8BBD9', '#FFD700'],
  'Classic White': ['#FFFFFF', '#F5F5F5'],
  'Sage & Cream': ['#87A96B', '#FFF8DC'],
  'Navy & Rose': ['#1E3A5F', '#E8B4B8'],
  'Burgundy & Gold': ['#800020', '#FFD700'],
  'Dusty Blue': ['#6B8CAE', '#E6F2FF'],
  'Terracotta & Cream': ['#C65D32', '#FFF8DC'],
  'Lavender & Silver': ['#B19CD9', '#C0C0C0']
}

export function generate4ColorPalette(
  selectedPaletteName?: string,
  existingColors?: string[]
): ColorPalette[] {
  // Get base 2 colors
  let baseColors: string[] = []
  
  if (existingColors && existingColors.length >= 2) {
    baseColors = existingColors.slice(0, 2)
  } else if (selectedPaletteName && COLOR_PALETTE_COLORS[selectedPaletteName]) {
    baseColors = COLOR_PALETTE_COLORS[selectedPaletteName]
  } else {
    // Fallback to Blush & Gold
    baseColors = COLOR_PALETTE_COLORS['Blush & Gold']
  }

  const [color1, color2] = baseColors
  const [h1, s1, l1] = hexToHsl(color1)
  const [h2, s2, l2] = hexToHsl(color2)

  // Generate 2 additional complementary colors
  // Color 3: Lighter version of color1
  const color3 = hslToHex(
    h1,
    Math.max(s1 * 0.6, 20), // Reduce saturation
    Math.min(l1 + 25, 90)   // Increase lightness
  )

  // Color 4: Warmer neutral (between the two base colors)
  const avgH = ((h1 + h2) / 2 + 360) % 360
  const color4 = hslToHex(
    avgH,
    Math.min((s1 + s2) / 3, 25), // Low saturation for neutral
    (l1 + l2) / 2 // Average lightness
  )

  return [
    { hex: color1 },
    { hex: color2 },
    { hex: color3 },
    { hex: color4 }
  ]
}

// Helper to get the palette name for display
export function getPaletteName(selectedPaletteName?: string): string {
  if (selectedPaletteName && COLOR_PALETTE_NAMES.includes(selectedPaletteName as any)) {
    return selectedPaletteName
  }
  return 'Custom Palette'
}