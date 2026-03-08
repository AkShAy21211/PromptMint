import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Ensure a profile exists for the user
            // We use upsert with ignoreDuplicates to avoid errors if the profile already exists
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(
                    { id: data.user.id },
                    { onConflict: 'id', ignoreDuplicates: true }
                )

            if (profileError) {
                console.error('Error creating profile in callback:', profileError.message)
            }

            // URL to redirect to after sign in process completes
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('Error exchanging code for session:', error?.message)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
