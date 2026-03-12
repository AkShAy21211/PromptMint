'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'

interface GoogleSignInButtonProps {
  onError?: (message: string) => void
}

export default function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_NETLIFY_URL || location.origin}/auth/callback`,
      },
    })

    if (error) {
      // Surface the error to the parent instead of silently swallowing it
      onError?.(error.message ?? 'Google sign-in failed. Please try again.')
      setLoading(false) // Only reset on error — success triggers a redirect
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      variant="outline"
      className="w-full gap-2 border-zinc-200 dark:border-white/10 bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-200/60 dark:hover:bg-white/10 text-foreground transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FaGoogle className="h-4 w-4 text-rose-400" />
      )}
      Continue with Google
    </Button>
  )
}