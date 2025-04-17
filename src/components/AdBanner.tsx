import React, { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
}

export default function AdBanner({ slot, format = 'auto' }: Props) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    if (!adRef.current || isAdPushed.current) return;

    try {
      // Initialize adsbygoogle if not already initialized
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      
      // Push the ad only if it hasn't been pushed before
      if (!isAdPushed.current) {
        (window as any).adsbygoogle.push({});
        isAdPushed.current = true;
      }
    } catch (error) {
      console.error('Error loading Google Ads:', error);
    }
  }, []);

  return (
    <div className="w-full min-w-[300px] flex justify-center my-4" ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '250px' }}
        data-ad-client="ca-pub-1138927615163611"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}