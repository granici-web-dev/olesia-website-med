'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { ANALYTICS, CONSENT_EVENT, type ConsentState } from '@/lib/analytics';

/* Loads each tracker only once the visitor has granted its category —
   GTM/GA4 on `analytics`, the Meta Pixel on `marketing`. The choice comes from
   our own banner (`CookieConsent.tsx`) via CONSENT_EVENT. Nothing here runs
   before consent, and it is a pure no-op while the client's tracker IDs are
   still missing from env. */

export function Analytics() {
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const onConsent = (e: CustomEvent<ConsentState>) => setConsent(e.detail);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return (
    <>
      {/* Use GTM *or* GA4, not both — set one of the two env IDs. If GTM is
          used, configure the GA4 tag inside the container to avoid double-counting. */}
      {consent.analytics && ANALYTICS.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ANALYTICS.gtmId}');`}
        </Script>
      )}

      {consent.analytics && ANALYTICS.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ANALYTICS.ga4Id}');`}
          </Script>
        </>
      )}

      {consent.marketing && ANALYTICS.pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ANALYTICS.pixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
