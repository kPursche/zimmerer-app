"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export function UrlForm({
  onCrawl,
  loading,
}: {
  onCrawl: (url: string) => void;
  loading: boolean;
}) {
  const [url, setUrl] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (url.trim()) onCrawl(url.trim());
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input
        type="url"
        inputMode="url"
        required
        placeholder="https://www.unser-chor.de"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 rounded-lg border border-brand-200 bg-white px-4 py-3 text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        Website crawlen
      </button>
    </form>
  );
}
