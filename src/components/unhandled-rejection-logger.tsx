'use client';

import { useEffect } from 'react';

export default function UnhandledRejectionLogger() {
  useEffect(() => {
    function onReject(e: PromiseRejectionEvent) {
      try {
        // Show detailed info in console for debugging
        console.error('Unhandled promise rejection:', e.reason);
        // You could also send this to a logging endpoint here
      } catch (err) {
        console.error('Error in rejection handler', err);
      }
    }
    window.addEventListener('unhandledrejection', onReject);
    return () => window.removeEventListener('unhandledrejection', onReject);
  }, []);
  return null;
}
