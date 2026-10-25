import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const supabaseUrl = 
    env.VITE_SUPABASE_URL || 
    env.SUPABASE_URL || 
    env.NEXT_PUBLIC_SUPABASE_URL || 
    ''

  const supabaseKey = 
    env.VITE_SUPABASE_ANON_KEY || 
    env.SUPABASE_ANON_KEY || 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    env.SUPABASE_KEY || 
    ''

  return {
    plugins: [react()],
    define: {
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl),
      '__SUPABASE_KEY__': JSON.stringify(supabaseKey),
    }
  }
})
