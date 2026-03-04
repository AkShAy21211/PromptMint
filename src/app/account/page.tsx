import { Suspense } from "react";
import AccountPageClient from "./AccountPageClient";

// The real account UI lives in a client-only component. We don't want
// `useSearchParams` (a client hook) to be called during server-side static
// generation, so we wrap the client component in a Suspense boundary here.
// This satisfies Next.js's requirement and prevents the "missing suspense"
// error during build.
export default function AccountPage() {
  return (
    <Suspense fallback={<div />}>
      <AccountPageClient />
    </Suspense>
  );
}
