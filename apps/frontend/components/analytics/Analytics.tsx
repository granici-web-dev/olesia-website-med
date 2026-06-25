'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { ANALYTICS } from '@/lib/analytics';

/* Loads the Cookiebot CMP (which renders the consent banner and auto-blocks
   third-party cookies), then loads each tracker only once its consent category
   is granted — GTM/GA4 on `statistics`, the Meta Pixel on `marketing`. Pure
   no-op when no Cookiebot CBID is set. GDPR-correct: nothing tracks before
   consent. Real IDs are configured via env when the client provides them. */

export function Analytics() {
  const [consent, setConsent] = useState({ statistics: false, marketing: false });

  useEffect(() => {
    const sync = () => {
      const c = window.Cookiebot?.consent;
      if (c) setConsent({ statistics: !!c.statistics, marketing: !!c.marketing });
    };
    // Cookiebot fires these on the window as it resolves / changes consent.
    window.addEventListener('CookiebotOnConsentReady', sync);
    window.addEventListener('CookiebotOnAccept', sync);
    window.addEventListener('CookiebotOnDecline', sync);
    sync(); // in case consent already resolved before this mounted
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', sync);
      window.removeEventListener('CookiebotOnAccept', sync);
      window.removeEventListener('CookiebotOnDecline', sync);
    };
  }, []);

  if (!ANALYTICS.cookiebotId) return null;

  return (
    <>
      {/* CMP — must keep id="Cookiebot" for auto-blocking to work. */}
      <Script
        id="Cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid={ANALYTICS.cookiebotId}
        data-blockingmode="auto"
        strategy="afterInteractive"
      />

      {/* Use GTM *or* GA4, not both — set one of the two env IDs. If GTM is
          used, configure the GA4 tag inside the container to avoid double-counting. */}
      {consent.statistics && ANALYTICS.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ANALYTICS.gtmId}');`}
        </Script>
      )}

      {consent.statistics && ANALYTICS.ga4Id && (
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
