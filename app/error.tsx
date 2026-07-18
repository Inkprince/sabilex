'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white text-black p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-6 max-w-2xl overflow-auto w-full border border-red-200">
        <p className="font-mono text-sm break-words">{error.message}</p>
        {error.stack && (
          <pre className="mt-4 text-xs whitespace-pre-wrap">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
