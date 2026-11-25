'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    // If Web Share API is supported (mainly mobile browsers)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err: any) {
        // Fallback to clipboard if user dismissed or error
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Tautan artikel berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Gagal menyalin tautan');
      }
    }
  };

  const handleWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://wa.me/?text=${shareText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-neutral-400 hidden sm:inline">Bagikan:</span>
      
      {/* WhatsApp Share */}
      <button
        onClick={handleWhatsApp}
        className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-neutral-600 dark:text-slate-300 transition-colors"
        title="Bagikan ke WhatsApp"
        aria-label="Bagikan ke WhatsApp"
      >
        <Share2 size={16} />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleShare}
        className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-neutral-600 dark:text-slate-300 transition-colors"
        title="Salin tautan artikel"
        aria-label="Salin tautan artikel"
      >
        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
      </button>
    </div>
  );
}
