/**
 * UTM tracking utility.
 *
 * Captures utm_* and referral params from the URL on first visit,
 * persists them in localStorage so they survive page reloads/SPA navigation,
 * and exposes a small helper to attach them to every lead submission.
 *
 * Recognised keys: utm_source, utm_medium, utm_campaign, utm_term, utm_content,
 *                  yclid (Yandex.Direct), gclid (Google), fbclid (Facebook), referrer.
 */

const STORAGE_KEY = "di_utm_v1";
const TRACKED_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "yclid",
  "gclid",
  "fbclid",
];

// Map raw utm_source values to a human label for Telegram digest readability.
// Add more aliases as you launch new ad campaigns.
const SOURCE_ALIASES = {
  vk: "ВК Реклама",
  vk_ads: "ВК Реклама",
  vkads: "ВК Реклама",
  avito: "Авито",
  avito_ads: "Авито Реклама",
  yandex: "Яндекс Директ",
  direct: "Яндекс Директ",
  yandex_direct: "Яндекс Директ",
  ya_direct: "Яндекс Директ",
  google: "Google Ads",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "Email",
};

function parseFromQuery(search) {
  const out = {};
  if (!search) return out;
  const params = new URLSearchParams(search);
  for (const key of TRACKED_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const fresh = parseFromQuery(window.location.search);
    // Only overwrite if URL actually contains utm-params (don't wipe on inner navigation).
    if (Object.keys(fresh).length > 0) {
      fresh._first_seen = new Date().toISOString();
      fresh._landing_url = window.location.href;
      fresh._referrer = document.referrer || "";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    // No utm in URL — keep existing one (returning visit).
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // First-time visit without utm — still record referrer for analytics.
      const initial = {
        _first_seen: new Date().toISOString(),
        _landing_url: window.location.href,
        _referrer: document.referrer || "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(existing);
  } catch {
    return {};
  }
}

export function getUtm() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSourceLabel(utmSource) {
  if (!utmSource) return null;
  const key = String(utmSource).toLowerCase().trim();
  return SOURCE_ALIASES[key] || utmSource;
}

// Build the `extra` payload to attach to a lead POST.
// Pass in any local extras (e.g. quiz answers) and they will be merged.
export function buildLeadExtra(localExtras = {}) {
  const utm = getUtm();
  const merged = { ...localExtras };

  if (utm.utm_source) {
    merged["UTM Источник"] = getSourceLabel(utm.utm_source);
    merged["utm_source"] = utm.utm_source;
  }
  if (utm.utm_medium) merged["utm_medium"] = utm.utm_medium;
  if (utm.utm_campaign) merged["UTM Кампания"] = utm.utm_campaign;
  if (utm.utm_term) merged["utm_term"] = utm.utm_term;
  if (utm.utm_content) merged["utm_content"] = utm.utm_content;
  if (utm.yclid) merged["yclid (Яндекс Директ)"] = utm.yclid;
  if (utm.gclid) merged["gclid (Google Ads)"] = utm.gclid;
  if (utm.fbclid) merged["fbclid (Facebook)"] = utm.fbclid;
  if (utm._referrer) merged["Referrer"] = utm._referrer;
  if (utm._landing_url) merged["Лендинг-URL"] = utm._landing_url;

  return merged;
}
