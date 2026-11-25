
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Truck,
  Apple,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Send,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Headphones,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { useOrganization } from '@/hooks/use-organization';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const StorefrontMap = dynamic(() => import('./StorefrontMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 w-full animate-pulse items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
      Memuat peta...
    </div>
  ),
});

function LazyStorefrontMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[160px] w-full">
      {shouldLoad ? (
        <StorefrontMap lat={lat} lng={lng} name={name} />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Memuat peta lokasi...
        </div>
      )}
    </div>
  );
}

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterNavGroup {
  title: string;
  links: FooterLink[];
}

const FOOTER_NAV: Record<string, FooterNavGroup> = {
  shop: {
    title: 'Jelajahi',
    links: [
      { label: 'Semua Produk', href: '/products' },
      { label: 'Kategori Produk', href: '/categories' },
      { label: 'Koleksi Terbaru', href: '/products?sort=new' },
      { label: 'Produk Terlaris', href: '/products?sort=popular' },
      { label: 'Promo Spesial', href: '/deals', badge: 'HOT' },
    ],
  },
  help: {
    title: 'Bantuan',
    links: [
      { label: 'Pusat Bantuan', href: '/help' },
      { label: 'Pertanyaan Umum', href: '/faq' },
      { label: 'Hubungi Kami', href: '/contact' },
      { label: 'Informasi Pengiriman', href: '/shipping' },
      { label: 'Pengembalian Produk', href: '/returns' },
    ],
  },
  company: {
    title: 'Informasi',
    links: [
      { label: 'Tentang Kami', href: '/about' },
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
      { label: 'Penghapusan Akun', href: '/delete-account' },
    ],
  },
};

const PAYMENT_METHODS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'Permata',
  'QRIS',
  'GoPay',
  'ShopeePay',
  'Visa',
  'Mastercard',
  'Zelvira Wallet',
];

const LOGISTIC_PARTNERS = [
  'JNE',
  'J&T Express',
  'SiCepat',
  'Anteraja',
  'GoSend',
  'GrabExpress',
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  const { organization } = useOrganization();
  const reduceMotion = useReducedMotion();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const reveal = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.65,
        ease: EASE,
      },
    },
  };

  const handleNewsletterSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const email = newsletterEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Masukkan alamat email yang valid.');
      return;
    }

    // Integrasikan dengan API newsletter untuk menyimpan email sungguhan.
    setIsSubscribed(true);
    setNewsletterEmail('');
    toast.success('Terima kasih telah bergabung dengan Zelvira!');
  };

  const socialLinks = [
    {
      icon: Instagram,
      href: organization?.instagramUrl,
      label: 'Instagram',
    },
    {
      icon: Facebook,
      href: organization?.facebookUrl,
      label: 'Facebook',
    },
    {
      icon: Twitter,
      href: organization?.twitterUrl,
      label: 'Twitter',
    },
    {
      icon: Youtube,
      href: organization?.youtubeUrl,
      label: 'YouTube',
    },
  ].filter(
    (item): item is {
      icon: typeof Instagram;
      href: string;
      label: string;
    } => Boolean(item.href),
  );

  const organizationName = organization?.name || 'Zelvira';

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.08] bg-[#09090b] text-neutral-400">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-48 left-[-10%] h-96 w-96 rounded-full bg-pink-500/[0.07] blur-[110px]" />
        <div className="absolute right-[-8%] top-1/3 h-80 w-80 rounded-full bg-violet-500/[0.05] blur-[100px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-pink-500/50 to-transparent" />
      </div>




      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              aria-label={`${organizationName} beranda`}
              className="group inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              <img
                src="/logo.png"
                alt={`${organizationName} Logo`}
                width={180}
                height={36}
                loading="lazy"
                decoding="async"
                className="h-9 w-auto max-w-[180px] object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            <p className="max-w-sm text-sm leading-7 text-neutral-400">
              Temukan pilihan busana, kecantikan, dan gaya hidup modern
              untuk melengkapi setiap momen istimewa Anda.
            </p>

            <div className="space-y-3.5 pt-1 text-sm">
              {organization?.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-pink-400"
                  />
                  <span className="leading-6 text-neutral-300">
                    {organization.address}
                  </span>
                </div>
              )}

              {organization?.phoneNumber && (
                <a
                  href={`https://wa.me/${organization.phoneNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 transition-colors hover:text-pink-300 focus-visible:outline-none focus-visible:text-pink-300"
                >
                  <Phone
                    size={16}
                    className="shrink-0 text-pink-400 transition-transform group-hover:rotate-[-8deg]"
                  />
                  <span>{organization.phoneNumber}</span>
                  <ExternalLink
                    size={12}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a >
              )}

              {
                organization?.email && (
                  <a
                    href={`mailto:${organization.email}`}
                    className="group flex items-center gap-3 break-all transition-colors hover:text-pink-300 focus-visible:outline-none focus-visible:text-pink-300"
                  >
                    <Mail size={16} className="shrink-0 text-pink-400" />
                    <span>{organization.email}</span>
                  </a>
                )
              }

              <div className="flex items-center gap-3 text-neutral-400">
                <Clock size={16} className="shrink-0 text-pink-400" />
                <span>Setiap hari, 08.00–22.00 WIB</span>
              </div>
            </div >

            {/* Social media */}
            {
              socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {socialLinks.map(({ icon: Icon, href, label }, index) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.04 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-neutral-400 transition-colors hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                    >
                      <Icon size={17} />
                    </motion.a>
                  ))}

                  {organization?.tiktokUrl && (
                    <motion.a
                      href={organization.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      title="TikTok"
                      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.04 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-neutral-400 transition-colors hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                    >
                      <span className="text-sm font-black">♪</span>
                    </motion.a>
                  )}
                </div>
              )
            }
          </div >

          {/* Navigation */}
          {
            Object.entries(FOOTER_NAV).map(([key, group]) => (
              <div key={key} className="space-y-5 lg:col-span-2">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  {group.title}
                </h3>

                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-pink-300"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {link.label}
                        </span>

                        {link.badge && (
                          <span className="rounded-md border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-300">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }

          {/* Store and app */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              Kunjungi Kami
            </h3>

            {organization?.latitude != null &&
              organization?.longitude != null ? (
              <LazyStorefrontMap
                lat={organization.latitude}
                lng={organization.longitude}
                name={organization.name || 'Zelvira Store'}
              />
            ) : (
              <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                  <MapPin size={20} />
                </div>
                <p className="text-sm font-semibold text-white">
                  {organizationName}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Indonesia
                </p>
              </div>
            )}

            {(organization?.appstoreUrl || organization?.playstoreUrl) && (
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Unduh Aplikasi
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {organization?.appstoreUrl && (
                    <a
                      href={organization.appstoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      <Apple size={19} className="text-white" />
                      <span className="text-xs font-semibold text-neutral-200">
                        App Store
                      </span>
                      <ArrowRight
                        size={14}
                        className="ml-auto text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-white"
                      />
                    </a>
                  )}

                  {organization?.playstoreUrl && (
                    <a
                      href={organization.playstoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      <Play size={18} className="fill-pink-400 text-pink-400" />
                      <span className="text-xs font-semibold text-neutral-200">
                        Google Play
                      </span>
                      <ArrowRight
                        size={14}
                        className="ml-auto text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-white"
                      />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>





        {/* Copyright */}
        < div className="flex flex-col gap-5 border-t border-white/[0.07] pt-7 md:flex-row md:items-center md:justify-between" >
          <div className="flex flex-col gap-2 text-center text-xs text-neutral-400 md:text-left">
            <p>
              © {new Date().getFullYear()} {organizationName}. Hak cipta
              dilindungi.
            </p>
            <p className="text-[11px]">
              Dibuat untuk menemani gaya dan keseharian Anda.
            </p>
          </div>


        </div >
      </div >
    </footer >
  );
}
