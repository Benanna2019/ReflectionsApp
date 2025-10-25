import { createContext, useContext, type ReactNode } from 'react'
import { db, useAuth as useInstantAuth } from '@/lib/db'
import { tx, id } from '@instantdb/react'
import type { User } from '@instantdb/react'

/**
 * Auth Context
 * 
 * Provides authentication state and methods throughout the app.
 * Uses InstantDB's built-in auth system with magic links.
 */

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: { message: string } | null
  sendMagicCode: (email: string) => Promise<void>
  signInWithMagicCode: (email: string, code: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Use InstantDB's auth hook
  const { isLoading, user, error } = useInstantAuth()

  /**
   * Send magic code via email
   * InstantDB will send a 6-digit code to the user's email
   */
  const sendMagicCode = async (email: string) => {
    try {
      await db.auth.sendMagicCode({ email })
    } catch (err) {
      console.error('Error sending magic code:', err)
      throw err
    }
  }

  /**
   * Verify magic code and sign in
   * User provides the 6-digit code from their email
   * Also checks if user profile exists and creates one if needed
   */
  const signInWithMagicCode = async (email: string, code: string) => {
    try {
      // Sign in with magic code
      await db.auth.signInWithMagicCode({ email, code })
      
      // After successful sign-in, check if user profile exists
      // We need to wait a moment for the auth state to update
      setTimeout(async () => {
        try {
          const { data } = await db.queryOnce({
            $users: {
              $: {
                where: {
                  email: email,
                },
              },
              profile: {},
            },
          })

          console.log('data', data)

          // Check if user exists and has no profile
          const user = data.$users?.[0]
          console.log('user', user)
          if (user && !user.profile) {
            // Create user profile
            const result = await db.transact([
              tx.userProfiles[id()]
                .update({
                  email: email,
                  subscriptionStatus: 'inactive',
                  createdAt: Date.now(),
                })
                .link({ $user: user.id }),
            ])
            console.log('result', result)
            console.log('User profile created successfully')
          }
        } catch (profileErr) {
          console.error('Error checking/creating user profile:', profileErr)
          // Don't throw here - user is already signed in
        }
      }, 500)
    } catch (err) {
      console.error('Error verifying magic code:', err)
      throw err
    }
  }

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await db.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
      throw err
    }
  }

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    error: error ?? null,
    sendMagicCode,
    signInWithMagicCode,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 * 
 * Access authentication state and methods from any component
 * 
 * @example
 * const { user, isLoading, sendMagicCode, signInWithMagicCode, signOut } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

