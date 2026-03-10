import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://promptmint.com';

    // Static routes
    const routes = [
        '',
        '/blog',
        '/pricing',
        '/editor',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Blog posts
    const blogPosts = [
        'nextjs-16-server-actions-caching',
        'svelte-5-supasvelte-stack-runes',
        'mcp-agentic-era-guide',
        'modernize-legacy-systems-structural-prompting',
    ].map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...blogPosts];
}
