"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
        if (pixelId) {
          ReactPixel.init(pixelId);
          ReactPixel.pageView();
        } else {
          console.warn("Facebook pixel ID not provided in NEXT_PUBLIC_FACEBOOK_PIXEL_ID");
        }
      })
      .catch((err) => {
        console.error("Failed to load Facebook pixel", err);
      });
  }, [pathname, searchParams]);

  return null;
}
