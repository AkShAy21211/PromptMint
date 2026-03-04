import { Html, Head, Main, NextScript } from 'next/document';

// This stub exists solely to satisfy the build process which
// occasionally attempts to resolve the legacy /_document page.
// Our app uses the new `app/` router and doesn't need custom
// document markup, so the default implementation is enough.
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
