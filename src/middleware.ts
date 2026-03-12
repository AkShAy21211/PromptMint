import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const netlifyUrl = process.env.NEXT_PUBLIC_NETLIFY_URL;

    // Redirect to Netlify if we are on Vercel and have a target URL set
    if (host.includes('vercel.app') && netlifyUrl) {
        const url = request.nextUrl.clone();
        url.hostname = new URL(netlifyUrl).hostname;
        url.protocol = 'https';
        return Response.redirect(url, 301);
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
