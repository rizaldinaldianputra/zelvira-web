'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Maximize2,
  ShoppingBag,
  Package,
  ArrowRight,
  Ticket,
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/services/api.client';
import { FileUploadService } from '@/services/file-upload.service';
import { ProductService } from '@/services/product.service';
import { formatImageUrl } from '@/lib/url-utils';
import { toast } from 'sonner';

interface ChatMessage {
  id: string | number;
  text: string;
  senderId: string;
  senderRole: string;
  attachmentUrl?: string | null;
  isMe: boolean;
  type: string;
  intent?: string | null;
  suggestLiveChat?: boolean;
  chatMode?: string | null;
  createdAt: Date;
}

const QUICK_PROMPTS = [
  '🔥 Produk terlaris minggu ini',
  '🎟️ Promo & voucher aktif hari ini',
  '📦 Cek status pesanan saya',
  '🚚 Info pengiriman & retur barang'
];

const productImageCache = new Map<string, string>();

function ProductImageItem({ slug, title, initialImage }: { slug: string; title: string; initialImage?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(
    initialImage ? formatImageUrl(initialImage) : (productImageCache.get(slug) || null)
  );

  useEffect(() => {
    if (initialImage) {
      const formatted = formatImageUrl(initialImage);
      productImageCache.set(slug, formatted);
      setImgUrl(formatted);
      return;
    }
    if (imgUrl) return;
    let isMounted = true;
    ProductService.getBySlug(slug)
      .then((data: any) => {
        if (!isMounted || !data) return;
        const rawImg = (data.images && data.images[0]) || data.imageUrl || '';
        if (rawImg) {
          const formatted = formatImageUrl(rawImg);
          productImageCache.set(slug, formatted);
          setImgUrl(formatted);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [slug, initialImage, imgUrl]);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        onError={() => {
          setImgUrl(null);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-pink-500 bg-pink-50/50 dark:bg-pink-950/20">
      <ShoppingBag size={22} />
    </div>
  );
}

export interface ExtractedProduct {
  title: string;
  slug: string;
  price?: string;
  category?: string;
  stock?: string;
  image?: string;
}

// Extract product links, order references, and vouchers from text to render direct interactive cards
function extractCards(text: string) {
  const products: ExtractedProduct[] = [];
  const orders: string[] = [];
  const vouchers: { code: string; title: string }[] = [];

  if (!text) return { cleanedText: text, products, orders, vouchers };

  // 1. Structured product block regex:
  // e.g. • **[Krem](https://zelvira.my.id/products/krem)** — Rp 150.000
  //      Kategori: Kerudung | Stok: 10 | Gambar: https://...
  const productBlockRegex = /(?:^[ \t]*[•\*\-\d\.]+[ \t]*)?\**\[(.*?)\]\((?:https?:\/\/[^\/\s\)]+)?\/products\/([a-zA-Z0-9_-]+)\)\**([^\n]*(?:\n[ \t]*(?:Kategori|Stok|Gambar|Stock|Category)[^\n]+)*)/gim;

  const blocksToRemove: string[] = [];
  let pMatch: RegExpExecArray | null;

  while ((pMatch = productBlockRegex.exec(text)) !== null) {
    const fullBlock = pMatch[0];
    const title = pMatch[1].trim();
    const slug = pMatch[2].trim();

    // Price
    const priceMatch = /(?:Rp\.?\s*[\d\.,]+)/i.exec(fullBlock);
    const price = priceMatch ? priceMatch[0].trim() : undefined;

    // Category
    const catMatch = /(?:Kategori|Category):[ \t]*([^|\n\)]+)/i.exec(fullBlock);
    const category = catMatch ? catMatch[1].trim() : undefined;

    // Stock
    const stockMatch = /(?:Stok|Stock):[ \t]*([^|\n\)]+)/i.exec(fullBlock);
    const stock = stockMatch ? stockMatch[1].trim() : undefined;

    // Image
    const imgMatch = /(?:Gambar|Image):[ \t]*([^\s\n\)]+)/i.exec(fullBlock);
    const image = imgMatch ? imgMatch[1].trim() : undefined;

    if (!products.some((p) => p.slug === slug)) {
      products.push({ title, slug, price, category, stock, image });
    }
    blocksToRemove.push(fullBlock);
  }

  // Remove the product blocks from the displayed text so it doesn't duplicate
  let cleanedText = text;
  for (const b of blocksToRemove) {
    cleanedText = cleanedText.replace(b, '');
  }

  // Fallback for simple markdown links not caught by block regex: [Title](.../products/slug)
  const simpleMdRegex = /\[(.*?)\]\((?:https?:\/\/[^\/]+)?\/products\/([a-zA-Z0-9_-]+)\)/g;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = simpleMdRegex.exec(cleanedText)) !== null) {
    const slug = sMatch[2];
    if (!products.some((p) => p.slug === slug)) {
      products.push({ title: sMatch[1], slug });
    }
  }

  // Clean ASCII markdown pipe table artifacts (|---|---|) if present in raw text
  cleanedText = cleanedText
    .replace(/\|[\s-:]+\|/g, '')
    .replace(/\|/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Order reference: ORD-...
  const orderRegex = /\b(ORD-[A-Za-z0-9-]+)\b/g;
  let oMatch: RegExpExecArray | null;
  while ((oMatch = orderRegex.exec(cleanedText)) !== null) {
    const orderNo = oMatch[1];
    if (!orders.includes(orderNo)) {
      orders.push(orderNo);
    }
  }

  // 3. Voucher / Promo code references (Only genuine codes with digits or explicit format, never common words)
  const IGNORE_WORDS = new Set([
    'ZELVIRA', 'PROMO', 'DISKON', 'HEMAT', 'ONGKIR', 'FLASH',
    'VOUCHER', 'KODE', 'KUPON', 'GRATIS', 'ORDER', 'CHAT', 'ADMIN',
    'STORE', 'OFFICIAL', 'ASSISTANT'
  ]);

  // Pattern A: Explicit label e.g. "Kode Voucher: DISKON10"
  const explicitVRegex = /(?:kode\s*(?:voucher|promo|kupon)|voucher|promo\s*code)[:\s]+[`*]*([A-Z0-9_\-]{4,20})[`*]*/gi;
  let evMatch: RegExpExecArray | null;
  while ((evMatch = explicitVRegex.exec(cleanedText)) !== null) {
    const code = evMatch[1].toUpperCase().trim();
    if (!IGNORE_WORDS.has(code) && !vouchers.some((v) => v.code === code)) {
      vouchers.push({ code, title: `Voucher Promo ${code}` });
    }
  }

  // Pattern B: Backtick code containing letters AND digits e.g. `DISKON10`
  const backtickRegex = /`([A-Z0-9_\-]{4,20})`/g;
  let btMatch: RegExpExecArray | null;
  while ((btMatch = backtickRegex.exec(cleanedText)) !== null) {
    const code = btMatch[1].toUpperCase().trim();
    if (/\d/.test(code) && !IGNORE_WORDS.has(code) && !vouchers.some((v) => v.code === code)) {
      vouchers.push({ code, title: `Voucher Promo ${code}` });
    }
  }

  // Pattern C: Promo prefix strictly followed by digits e.g. DISKON10, HEMAT20
  const prefixDigitsRegex = /\b((?:ZELVIRA|DISKON|HEMAT|PROMO|ONGKIR|FLASH)[0-9]+[A-Z0-9]*)\b/gi;
  let pdMatch: RegExpExecArray | null;
  while ((pdMatch = prefixDigitsRegex.exec(cleanedText)) !== null) {
    const code = pdMatch[1].toUpperCase().trim();
    if (!IGNORE_WORDS.has(code) && !vouchers.some((v) => v.code === code)) {
      vouchers.push({ code, title: `Voucher Promo ${code}` });
    }
  }

  return { cleanedText, products, orders, vouchers };
}

export default function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'AI' | 'LIVE_CS'>('AI');
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  const handleClaimVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    toast.success(`Voucher "${code}" berhasil disalin! Siap digunakan saat checkout.`);
    setTimeout(() => setCopiedVoucher(null), 3000);
  };

  // Anti-Spam state (Matching Mobile)
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sentTimestamps = useRef<number[]>([]);

  // Room & Identity
  const [roomId, setRoomId] = useState<string>('guest_session');
  const [myId, setMyId] = useState<string>('guest');
  const [isMember, setIsMember] = useState(false);

  const stompClient = useRef<Client | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize user and room ID
  useEffect(() => {
    const user = authService.getUser();
    if (user && (user.id || user.email)) {
      const uid = user.id ? String(user.id) : user.email;
      setRoomId(`user_${uid}`);
      setMyId(uid);
      setIsMember(true);
    } else {
      let guestId = '';
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zelixa_chat_guest_id');
        if (stored) {
          guestId = stored;
        } else {
          guestId = `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
          localStorage.setItem('zelixa_chat_guest_id', guestId);
        }
      }
      setRoomId(guestId || 'guest_general');
      setMyId(guestId || 'guest');
      setIsMember(false);
    }
  }, []);

  // 2. Fetch history and connect WebSocket only when roomId is established AND chat is opened
  useEffect(() => {
    if (!roomId || !isOpen) return;

    let isMounted = true;

    // Fetch History & Mode Status
    const fetchHistory = async () => {
      try {
        const [res, statusRes] = await Promise.all([
          apiClient.get<any>(`/v1/chat/${roomId}/history`, { silent: true }),
          apiClient.get<any>(`/v1/chat/${roomId}/status`, { silent: true }).catch(() => null),
        ]);

        const modeFromStatus = statusRes?.chatMode || statusRes?.data?.chatMode;
        if (isMounted && (modeFromStatus === 'AI' || modeFromStatus === 'LIVE_CS')) {
          setChatMode(modeFromStatus);
        }

        const list = Array.isArray(res)
          ? res
          : (res?.data && Array.isArray(res.data) ? res.data : []);

        if (isMounted && list.length > 0) {
          const mapped: ChatMessage[] = list.map((item: any) => {
            const isMe =
              item.senderRole !== 'ADMIN' &&
              item.senderRole !== 'CS' &&
              item.senderRole !== 'AI' &&
              item.senderRole !== 'SYSTEM';
            return {
              id: item.id || `${Date.now()}_${Math.random()}`,
              text: item.content || '',
              senderId: item.senderId || '',
              senderRole: item.senderRole || '',
              attachmentUrl: item.attachmentUrl || null,
              isMe,
              type: item.type || 'CHAT',
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            };
          });
          setMessages(mapped);
          scrollToBottom();
        }
      } catch (err) {
        console.warn('[ChatFAB] History fetch warning:', err);
      }
    };

    fetchHistory();

    // Determine native WebSocket endpoint
    const getWsUrl = () => {
      if (typeof window === 'undefined') return '';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        return 'ws://localhost:8081/ws-chat-native';
      }
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.zelvira.co.id/api';
      const cleanBase = apiBase.replace(/\/api\/?$/, '').replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
      return `${cleanBase}/ws-chat-native`;
    };

    const wsUrl = getWsUrl();
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (!isMounted) return;
        setIsConnected(true);

        // Subscribe to room destination
        client.subscribe(`/topic/room/${roomId}`, (messageFrame) => {
          if (!messageFrame.body || !isMounted) return;
          try {
            const data = JSON.parse(messageFrame.body);
            const type = data.type || 'CHAT';

            if (type === 'ERROR_COOLDOWN') {
              const seconds = data.retryAfterSeconds || 15;
              startCooldown(seconds);
              setIsAiTyping(false);
              toast.error(data.content || 'Spam terdeteksi! Harap tunggu sebentar.');
              return;
            }

            if (type === 'TYPING') {
              setIsAiTyping(true);
              scrollToBottom();
              return;
            }

            if (data.senderRole === 'AI' || data.senderRole === 'ADMIN' || data.senderRole === 'CS') {
              setIsAiTyping(false);
            }

            if (data.chatMode === 'AI' || data.chatMode === 'LIVE_CS') {
              setChatMode(data.chatMode);
            } else if (data.senderRole === 'ADMIN') {
              setChatMode('LIVE_CS');
            }

            if (type === 'JOIN') return;

            const isMe =
              data.senderRole !== 'ADMIN' &&
              data.senderRole !== 'CS' &&
              data.senderRole !== 'AI' &&
              data.senderRole !== 'SYSTEM';

            setMessages((prev) => [
              ...prev,
              {
                id: data.id || `${Date.now()}_${Math.random()}`,
                text: data.content || '',
                senderId: data.senderId || '',
                senderRole: data.senderRole || '',
                attachmentUrl: data.attachmentUrl || null,
                isMe,
                type,
                intent: data.intent || null,
                suggestLiveChat: Boolean(data.suggestLiveChat),
                chatMode: data.chatMode || null,
                createdAt: new Date(),
              },
            ]);
            scrollToBottom();
          } catch (e) {
            console.error('[ChatFAB] Incoming parse error:', e);
          }
        });

        // Announce JOIN
        client.publish({
          destination: `/app/chat/${roomId}/addUser`,
          body: JSON.stringify({
            roomId,
            senderId: myId,
            senderRole: 'CUSTOMER',
            type: 'JOIN',
          }),
        });
      },
      onDisconnect: () => {
        if (isMounted) setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('[ChatFAB] STOMP broker error:', frame.headers['message']);
        if (isMounted) setIsConnected(false);
      },
      onWebSocketError: () => {
        if (isMounted) setIsConnected(false);
      },
    });

    try {
      client.activate();
      stompClient.current = client;
    } catch (e) {
      console.warn('[ChatFAB] Stomp activate error:', e);
    }

    return () => {
      isMounted = false;
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [roomId, myId, isOpen]);

  // Switch between AI Assistant and Live CS Admin
  const handleSwitchMode = async (targetMode: 'AI' | 'LIVE_CS') => {
    if (!roomId || isSwitchingMode || chatMode === targetMode) return;
    setIsSwitchingMode(true);
    try {
      await apiClient.post(`/v1/chat/${roomId}/mode`, { mode: targetMode });
      setChatMode(targetMode);
      toast.success(
        targetMode === 'LIVE_CS'
          ? 'Terhubung ke antrian Live CS Admin'
          : 'Kembali ke Asisten AI Zelvira'
      );
    } catch (e) {
      toast.error('Gagal mengganti mode obrolan');
    } finally {
      setIsSwitchingMode(false);
    }
  };

  // Anti-Spam Timer
  const startCooldown = (seconds: number) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldownRemaining(seconds);

    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 120);
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages.length]);

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Silakan pilih berkas gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send Message
  const handleSendMessage = async (customText?: string) => {
    if (cooldownRemaining > 0) return;

    const textToSend = (customText ?? inputText).trim();
    if (!textToSend && !selectedImage) return;

    // Client-side spam detection (max 5 messages per 5s)
    const now = Date.now();
    sentTimestamps.current = sentTimestamps.current.filter((t) => now - t < 5000);
    sentTimestamps.current.push(now);

    if (sentTimestamps.current.length > 5) {
      startCooldown(15);
      toast.warning('Anda mengirim pesan terlalu cepat! Harap tunggu 15 detik.');
      return;
    }

    let uploadedUrl: string | null = null;
    if (selectedImage) {
      setIsUploading(true);
      try {
        uploadedUrl = await FileUploadService.upload(selectedImage);
        clearSelectedImage();
      } catch (e: any) {
        toast.error('Gagal mengunggah gambar. Mengirim pesan teks...');
      } finally {
        setIsUploading(false);
      }
    }

    if (!uploadedUrl && !textToSend) return;

    if (stompClient.current && isConnected) {
      try {
        if (chatMode === 'AI') {
          setIsAiTyping(true);
        }
        stompClient.current.publish({
          destination: `/app/chat/${roomId}/sendMessage`,
          body: JSON.stringify({
            roomId,
            senderId: myId,
            senderRole: 'CUSTOMER',
            content: textToSend,
            attachmentUrl: uploadedUrl,
            type: 'CHAT',
          }),
        });
      } catch (e) {
        console.error('[ChatFAB] Send publish error:', e);
        toast.error('Gagal mengirim pesan');
      }
    } else {
      toast.error('Koneksi obrolan terputus. Menghubungkan kembali...');
    }

    if (!customText) setInputText('');
    scrollToBottom();
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-90 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Lightbox Modal for Attachment Zoom */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={zoomImage}
              alt="Zoomed attachment"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-[calc(100vw-1.5rem)] sm:w-105 max-w-105 h-135 sm:h-145 max-h-[75vh] sm:max-h-[85vh] bg-white dark:bg-neutral-900 rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 text-white relative shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white shadow-inner">
                      <Sparkles size={22} className="fill-white" />
                    </div>
                    {/* Online status indicator dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-rose-500 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">
                        {chatMode === 'AI' ? 'Zelvira AI Assistant' : 'Live CS Admin'}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">
                        {isMember ? 'Member' : 'Tamu'}
                      </span>
                    </h4>
                    <p className="text-[11px] font-medium text-pink-100 flex items-center gap-1.5 mt-0.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                      {isConnected
                        ? chatMode === 'AI'
                          ? 'AI Aktif • Bisa alihkan ke Live CS'
                          : 'Mode Live CS • Terhubung ke Admin'
                        : 'Menghubungkan ke server...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={isSwitchingMode}
                    onClick={() => handleSwitchMode(chatMode === 'AI' ? 'LIVE_CS' : 'AI')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-[10px] font-extrabold tracking-wide text-white transition-all active:scale-95 disabled:opacity-50"
                    title={chatMode === 'AI' ? 'Beralih ke Live Chat Admin' : 'Kembali ke Asisten AI'}
                  >
                    {chatMode === 'AI' ? '👩‍💼 Live CS' : '🤖 Mode AI'}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-all active:scale-90"
                    aria-label="Tutup Obrolan"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Anti-Spam Warning Banner */}
            {cooldownRemaining > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-4 py-2 flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300"
              >
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Pesan dibatasi sementara (Anti-Spam). Tunggu {cooldownRemaining} detik.</span>
              </motion.div>
            )}

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="grow p-5 space-y-4 overflow-y-auto scroll-smooth bg-neutral-50/60 dark:bg-neutral-950/40"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <div className="w-16 h-16 rounded-3xl bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30 flex items-center justify-center mb-4 text-pink-500">
                    <MessageSquare size={28} />
                  </div>
                  <h5 className="font-black text-sm text-neutral-800 dark:text-neutral-200 mb-1">
                    Halo! Ada yang bisa kami bantu?
                  </h5>
                  <p className="text-xs text-neutral-400 max-w-60 mb-6">
                    Asisten AI Zelvira siap menjawab seputar produk, stok, promo, & pesanan. Jika butuh bantuan lebih lanjut, Anda bisa beralih ke Live CS Admin kapan saja.
                  </p>

                  <div className="w-full space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-left">
                      Pertanyaan Cepat:
                    </p>
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800/80 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 transition-all shadow-xs flex items-center justify-between"
                      >
                        <span>{prompt}</span>
                        <Send size={12} className="opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.isMe;
                  const showLiveCsButton =
                    !isMe &&
                    chatMode === 'AI' &&
                    (msg.suggestLiveChat ||
                      (msg.text &&
                        (msg.text.includes('Live CS') ||
                          msg.text.toLowerCase().includes('hubungi live cs'))));

                  const { cleanedText, products: productCards, orders: orderCards, vouchers: voucherCards } = extractCards(msg.text);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
                    >
                      {!isMe && (
                        <span className="text-[10px] font-bold text-neutral-400 ml-1">
                          {msg.senderRole === 'ADMIN'
                            ? '👩‍💼 Admin Live CS'
                            : msg.senderRole === 'AI'
                              ? '🤖 Zelvira AI Assistant'
                              : 'Zelvira Support'}
                        </span>
                      )}

                      <div
                        className={`max-w-[85%] rounded-[1.4rem] p-3.5 shadow-sm transition-all ${isMe
                          ? 'bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-tr-none shadow-pink-500/10'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-tl-none border border-neutral-100 dark:border-white/5'
                          }`}
                      >
                        {/* Image Attachment Rendering */}
                        {msg.attachmentUrl && (
                          <div className="mb-2 relative rounded-xl overflow-hidden group/img cursor-pointer">
                            <img
                              src={msg.attachmentUrl}
                              alt="Lampiran"
                              className="max-h-52 w-auto object-cover rounded-xl"
                              onClick={() => setZoomImage(msg.attachmentUrl || null)}
                            />
                            <div
                              onClick={() => setZoomImage(msg.attachmentUrl || null)}
                              className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <Maximize2 size={18} />
                            </div>
                          </div>
                        )}

                        {/* Text Message Content (Product text blocks stripped so they don't duplicate) */}
                        {cleanedText && (
                          <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
                            {cleanedText}
                          </p>
                        )}

                        {/* Interactive Product Cards (Full with Photo, Price, Category, Stock & Lihat button) */}
                        {productCards.length > 0 && (
                          <div className={`space-y-2.5 ${cleanedText ? 'mt-3 pt-2.5 border-t border-neutral-100 dark:border-white/10' : ''}`}>
                            {productCards.map((p, pIdx) => (
                              <a
                                key={pIdx}
                                href={`/products/${p.slug}`}
                                className="block p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-pink-500 dark:hover:border-pink-500 transition-all shadow-xs group hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  {/* FOTO PRODUK */}
                                  <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-center relative">
                                    <ProductImageItem slug={p.slug} title={p.title} initialImage={p.image} />
                                  </div>

                                  {/* DETAIL PRODUK */}
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {p.category && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-900/30">
                                          {p.category}
                                        </span>
                                      )}
                                      {p.stock && (
                                        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                          Stok: {p.stock}
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-pink-600 transition-colors" title={p.title}>
                                      {p.title}
                                    </h6>
                                    {p.price && (
                                      <div className="text-xs font-black text-pink-600 dark:text-pink-400">
                                        {p.price}
                                      </div>
                                    )}
                                  </div>

                                  {/* TOMBOL LIHAT */}
                                  <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-transform group-hover:scale-105">
                                    <span>Lihat</span>
                                    <ArrowRight size={13} />
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Interactive Order Cards */}
                        {orderCards.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-white/10 space-y-2">
                            {orderCards.map((orderNo, oIdx) => (
                              <a
                                key={oIdx}
                                href={`/account/orders?id=${orderNo}`}
                                className="block p-2.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/40 transition-all shadow-xs group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Package size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                      Pesanan Zelvira
                                    </span>
                                    <h6 className="text-xs font-mono font-bold text-neutral-900 dark:text-white truncate">
                                      {orderNo}
                                    </h6>
                                  </div>
                                  <div className="flex items-center text-xs font-black text-indigo-600 dark:text-indigo-400 gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                                    <span>Lacak</span>
                                    <ArrowRight size={13} />
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Interactive Voucher / Promo Cards */}
                        {voucherCards.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-white/10 space-y-2">
                            {voucherCards.map((v, vIdx) => (
                              <div
                                key={vIdx}
                                className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 shadow-xs space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                      <Ticket size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                        Voucher Promo
                                      </span>
                                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {v.code}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full shrink-0">
                                    Aktif
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-amber-200/40 dark:border-amber-800/30">
                                  <button
                                    type="button"
                                    onClick={() => handleClaimVoucher(v.code)}
                                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black tracking-wide flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                  >
                                    {copiedVoucher === v.code ? (
                                      <>
                                        <Check size={12} className="text-white" />
                                        <span>Tersalin!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>Klaim & Salin Kode</span>
                                      </>
                                    )}
                                  </button>
                                  <a
                                    href="/promo"
                                    className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[10px] font-black flex items-center gap-1 transition-all"
                                  >
                                    <span>Promo</span>
                                    <ArrowRight size={11} />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick Escalate to Live CS Button when AI suggests it */}
                        {showLiveCsButton && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-700/60">
                            <button
                              type="button"
                              disabled={isSwitchingMode}
                              onClick={() => handleSwitchMode('LIVE_CS')}
                              className="w-full py-2 px-3 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 hover:opacity-95 text-white text-[11px] font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
                            >
                              <span>👩‍💼 Hubungi Live CS Sekarang (Chat Admin)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp and Read Status */}
                      <div className={`flex items-center gap-1 text-[9px] font-bold text-neutral-400 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        <span>
                          {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck size={11} className="text-pink-500" />}
                      </div>
                    </div>
                  );
                })
              )}

              {/* AI Typing Indicator */}
              {isAiTyping && (
                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-[10px] font-bold text-neutral-400 ml-1">
                    🤖 Zelvira AI Assistant
                  </span>
                  <div className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-[1.4rem] rounded-tl-none border border-neutral-100 dark:border-white/5 p-3.5 shadow-sm flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                      AI sedang menulis...
                    </span>
                    <span className="flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-pink-50 text-pink-600 text-xs font-bold animate-pulse">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengunggah foto...</span>
                </div>
              )}
            </div>

            {/* Selected Image Preview before sending */}
            {imagePreviewUrl && (
              <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-neutral-200 shadow-sm"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-neutral-800 dark:text-white">Foto siap dikirim</p>
                    <p className="text-[10px] text-neutral-400">{(selectedImage?.size ? (selectedImage.size / 1024).toFixed(0) : 0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={clearSelectedImage}
                  className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={cooldownRemaining > 0 || isUploading}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-40 shrink-0"
                  title="Lampirkan Gambar"
                >
                  <ImageIcon size={20} />
                </button>

                <input
                  type="text"
                  placeholder={
                    cooldownRemaining > 0
                      ? `Harap tunggu ${cooldownRemaining}s...`
                      : 'Ketik pesan...'
                  }
                  value={inputText}
                  disabled={cooldownRemaining > 0}
                  onChange={(e) => setInputText(e.target.value)}
                  className="grow py-3 px-4 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-neutral-400"
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !selectedImage) || cooldownRemaining > 0 || isUploading}
                  className="w-10 h-10 rounded-2xl bg-linear-to-r from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_35px_rgba(244,63,94,0.35)] relative overflow-hidden group transition-all duration-300 ${isOpen
          ? 'bg-neutral-900 text-white'
          : 'bg-linear-to-tr from-rose-500 via-pink-500 to-rose-600 text-white'
          }`}
        aria-label="Live Chat Support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <MessageSquare size={24} className="fill-white/20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live status dot on FAB */}
        {!isOpen && (
          <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-neutral-900 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
