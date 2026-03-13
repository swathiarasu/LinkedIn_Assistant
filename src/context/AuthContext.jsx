import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking session

  // ── On mount: restore existing session ──────────────────────────────────
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch extended profile from `profiles` table ─────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) setProfile(data)
    setLoading(false)
  }

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signup = async ({ name, email, password, headline, linkedinUrl }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // stored in auth.users raw_user_meta_data
      },
    })

    if (error) return { error: error.message }

    // Create extended profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        headline:      headline || '',
        linkedin_url:  linkedinUrl || '',
        posts_analyzed:   0,
        drafts_generated: 0,
      })
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

    if (!error && data) setProfile(data)
    return error ? { error: error.message } : { success: true }
  }

  // ── Increment usage stats ─────────────────────────────────────────────────
  const incrementStats = async (field) => {
    if (!profile) return
    await updateProfile({ [field]: (profile[field] || 0) + 1 })
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signup,
      login,
      logout,
      updateProfile,
      incrementStats,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
