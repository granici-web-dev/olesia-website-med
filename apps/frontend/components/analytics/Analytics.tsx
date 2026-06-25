'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { ANALYTICS, analyticsConfigured, readConsent, type Consent } from '@/lib/analytics';
import { ConsentBanner } from './ConsentBanner';

/* Loads the configured trackers (GTM / GA4 / Meta Pixel) only after the visitor
   grants consent — GDPR-correct: nothing runs before "Accept". Renders the
   consent banner while the decision is pending. Pure no-op when no IDs are set. */

export function Analytics({ locale }: { locale: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const load = ready && consent === 'granted' && analyticsConfigured;

  return (
    <>
      {load && ANALYTICS.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ANALYTICS.gtmId}');`}
        </Script>
      )}

      {load && ANALYTICS.ga4Id && (
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

      {load && ANALYTICS.pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ANALYTICS.pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {ready && consent === null && analyticsConfigured && (
        <ConsentBanner
          locale={locale}
          onAccept={() => setConsent('granted')}
          onReject={() => setConsent('denied')}
        />
      )}
    </>
  );
}
