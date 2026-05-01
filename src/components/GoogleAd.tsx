'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface GoogleAdProps {
  slot?: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

export default function GoogleAd({ 
  slot,
  format = "auto", 
  responsive = "true",
  style = { display: 'block' }
}: GoogleAdProps) {
  const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  const adSlot = slot ?? process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT;

  useEffect(() => {
    if (!publisherId || !adSlot) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (err) {
      console.error('Google Ads error', err);
    }
  }, [adSlot, publisherId]);

  if (!publisherId || !adSlot) {
    return null;
  }

  return (
    <div className="google-ad-container" style={{ margin: '2rem 0', textAlign: 'center', ...style }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client={publisherId}
           data-ad-slot={adSlot}
           data-ad-format={format}
           data-full-width-responsive={responsive}></ins>
    </div>
  );
}
