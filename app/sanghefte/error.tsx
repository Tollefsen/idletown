"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
      <div className="max-w-md w-full bg-stone-100 rounded-lg shadow-xl p-8 text-center border border-amber-200">
        <h2 className="text-2xl font-serif font-bold text-red-700 mb-4">
          Sanghefte-feil
        </h2>
        <p className="text-amber-900 mb-6">
          {error.message || "Kunne ikke laste sangheftet"}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Prøv Igjen
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors inline-block font-medium"
          >
            Gå Hjem
          </a>
        </div>
      </div>
    </div>
  );
}
