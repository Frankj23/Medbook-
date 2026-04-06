import { createContext, useContext, useState } from 'react'
import { loginUser as apiLoginUser } from '../services/client'

export const ROLES = {
  receptionist: { id: 'RC-0001', name: 'Amara Diallo',       title: 'Receptionist',        initials: 'AD', color: '#0b6e6e', home: '/register' },
  doctor:       { id: 'DR-1024', name: 'Dr. Sarah Jenkins',  title: 'General Physician',   initials: 'SJ', color: '#005454', home: '/doctor/dashboard' },
  lab_tech:     { id: 'LB-7431', name: 'Alex Rivera',        title: 'Lab Technician',      initials: 'AR', color: '#1a5c5c', home: '/lab/desktop/queue' },
  admin:        { id: 'AD-0001', name: 'John Mensah',        title: 'System Administrator', initials: 'JM', color: '#004545', home: '/admin' },
  patient:      { id: 'PT-0000', name: 'Registered Patient', title: 'Patient',             initials: 'PT', color: '#005454', home: '/' },
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('labflow_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async (id, password) => {
    try {
      const response = await apiLoginUser(id, password)
      const userData = response.user
      const roleData = ROLES[userData.role]
      if (!roleData) {
        throw new Error('Invalid user role')
      }
      const u = { ...roleData, ...userData, roleKey: userData.role }
      localStorage.setItem('labflow_user', JSON.stringify(u))
      setUser(u)
      return u
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('labflow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
