import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Simple local auth — stores users in localStorage (perfect for hackathon demo)
const USERS_KEY = 'lva_users'
const SESSION_KEY = 'lva_session'

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users))
const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
const saveSession = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user))
const clearSession = () => localStorage.removeItem(SESSION_KEY)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSession)

  const signup = ({ name, email, password, headline, linkedinUrl }) => {
    const users = getUsers()
    if (users[email]) return { error: 'An account with this email already exists.' }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // NOTE: plaintext for demo — use hashing in production
      headline: headline || '',
      linkedinUrl: linkedinUrl || '',
      createdAt: new Date().toISOString(),
      postsAnalyzed: 0,
      draftsGenerated: 0,
    }

    users[email] = newUser
    saveUsers(users)

    const sessionUser = { ...newUser }
    delete sessionUser.password
    saveSession(sessionUser)
    setUser(sessionUser)
    return { success: true }
  }

  const login = (email, password) => {
    const users = getUsers()
    const found = users[email]
    if (!found) return { error: 'No account found with this email.' }
    if (found.password !== password) return { error: 'Incorrect password.' }

    const sessionUser = { ...found }
    delete sessionUser.password
    saveSession(sessionUser)
    setUser(sessionUser)
    return { success: true }
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  const updateProfile = (updates) => {
    const users = getUsers()
    const updated = { ...users[user.email], ...updates }
    users[user.email] = updated
    saveUsers(users)

    const sessionUser = { ...updated }
    delete sessionUser.password
    saveSession(sessionUser)
    setUser(sessionUser)
  }

  const incrementStats = (field) => {
    updateProfile({ [field]: (user[field] || 0) + 1 })
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, incrementStats }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
