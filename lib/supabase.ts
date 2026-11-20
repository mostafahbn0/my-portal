import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  'https://pcgwfnevqoowerjeyhgk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo'
)
