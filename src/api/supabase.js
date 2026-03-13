import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars — check your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Saved posts ──────────────────────────────────────────────────────────────

export const savePost = async (userId, { topic, label, post }) => {
  const { data, error } = await supabase
    .from('saved_posts')
    .insert({ user_id: userId, topic, label, post })
    .select()
    .single()
  if (error) console.error('savePost error:', error.message)
  return { data, error }
}

export const fetchSavedPosts = async (userId) => {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) console.error('fetchSavedPosts error:', error.message)
  return { data: data || [], error }
}

export const deleteSavedPost = async (postId) => {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('id', postId)
  if (error) console.error('deleteSavedPost error:', error.message)
  return { error }
}
