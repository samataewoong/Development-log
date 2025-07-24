import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bsntktkclpwkbbaogfcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnRrdGtjbHB3a2JiYW9nZmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTc5ODcsImV4cCI6MjA2Nzg3Mzk4N30.e7LAmpzEocXMxhhAwTQqOp1of7FYvppxrqJA4ZCHmaE';
export const supabase = createClient(supabaseUrl, supabaseKey);