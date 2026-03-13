import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.id)

      if (session?.user) {
        setUser(session.user)
        // On first signup, create the profile row
        if (event === 'SIGNED_IN') {
          await ensureProfile(session.user)
        }
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Creates profile row if it doesn't exist yet
  const ensureProfile = async (authUser) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('profiles').insert({
        id:               authUser.id,
        name:             authUser.user_metadata?.name || '',
        email:            authUser.email,
        headline:         authUser.user_metadata?.headline || '',
        linkedin_url:     authUser.user_metadata?.linkedin_url || '',
        posts_analyzed:   0,
        drafts_generated: 0,
      })
      if (error) console.error('ensureProfile error:', error.message)
      else console.log('Profile row created for', authUser.email)
    }
  }

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('fetchProfile error:', error.message)
    if (!error && data) setProfile(data)
    setLoading(false)
  }

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signup = async ({ name, email, password, headline, linkedinUrl }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          headline:    headline || '',
          linkedin_url: linkedinUrl || '',
        },
      },
    })
    if (error) return { error: error.message }

    // Manually insert profile right away as a safety net
    // (the onAuthStateChange trigger will also try, but this ensures it runs)
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id:               data.user.id,
        name,
        email,
        headline:         headline || '',
        linkedin_url:     linkedinUrl || '',
        posts_analyzed:   0,
        drafts_generated: 0,
      }, { onConflict: 'id' })

      if (profileError) console.error('Signup profile upsert error:', profileError.message)
      else console.log('Profile upserted for', email)
    }

    return { success: true }
  }

  // ── Log in ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { success: true }
  }

  // ── Log out ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
  }

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) console.error('updateProfile error:', error.message)
    if (!error && data) setProfile(data)
    return error ? { error: error.message } : { success: true }
  }

  // ── Increment usage stats ─────────────────────────────────────────────────
  const incrementStats = async (field) => {
    if (!profile) return
    await updateProfile({ [field]: (profile[field] || 0) + 1 })
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, updateProfile, incrementStats }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
