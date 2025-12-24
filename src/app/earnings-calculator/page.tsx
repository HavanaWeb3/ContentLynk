'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EarningsCalculatorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the static HTML version
    window.location.href = '/earnings-calculator.html';
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FBB03B 100%)'
    }}>
      <p style={{ color: 'white', fontSize: '1.2em' }}>Loading calculator...</p>
    </div>
  );
}
