import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function connectDB() {
  // For compatibility with existing code structure
  return {
    users: {
      findOne: async (query) => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .match(query)
          .single();
        return error ? null : data;
      },
      insertOne: async (doc) => {
        const { data, error } = await supabase
          .from('users')
          .insert([doc])
          .select()
          .single();
        if (error) throw error;
        return { insertedId: data.id };
      }
    }
  };
}
