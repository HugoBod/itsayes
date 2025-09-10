'use client'

import { createClientComponentClient } from './supabase'

// Use the singleton client to avoid multiple instances
export const supabase = createClientComponentClient()

export default supabase