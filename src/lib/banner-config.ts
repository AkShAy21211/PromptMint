/**
 * Banner Configuration
 * Centralized control for all banner announcements
 * Can be easily switched on/off or updated for future campaigns
 */

export interface BannerConfig {
  enabled: boolean;
  type: "beta" | "promo" | "alert" | "announcement";
  dismissible: boolean;
  storageDismissKey: string;
}

export const BANNER_CONFIG: Record<string, BannerConfig> = {
  beta: {
    enabled: false, // Toggle this to enable/disable the beta banner
    type: "beta",
    dismissible: true,
    storageDismissKey: "promptmint_beta_banner_dismissed",
  },
  // Future banners can be added here
  // promo: {
  //   enabled: false,
  //   type: "promo",
  //   dismissible: true,
  //   storageDismissKey: "promptmint_promo_banner_dismissed",
  // },
};

export const getBetaBannerConfig = () => BANNER_CONFIG.beta;
