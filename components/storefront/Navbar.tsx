
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
  MapPin,
  LogOut,
  Settings,
  ChevronRight,
  Sparkles,
  Home,
  LogIn,
  Compass,
  LayoutGrid,
  Percent,
} from 'lucide-react';

import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { AuthUser } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { CategoryService } from '@/services/category.service';
import { Category } from '@/types/category';
import { formatImageUrl } from '@/lib/url-utils';

const getCategoryIcon = (name: string) => {
  const map: Record<string, string> = {
    Fashion: '👗',
    Shoes: '👟',
    Bags: '👜',
    Beauty: '💄',
    Electronics: '📱',
    Home: '🏠',
  };

  return map[name] || '✨';
};

const suggestions = [
  'Pastel Hoodie',
  'Platform Sneakers',
  'Mini Crossbody Bag',
  'Rose Gold Watch',
  'Aesthetic Room Decor',
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesHovered, setCategoriesHovered] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    path === '/'
      ? pathname === '/'
      : pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    const checkAuth = () => {
      setIsLoggedIn(authService.isLoggedIn());
      setUser(authService.getUser());
    };

    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAll();
        setCategories(response.content || []);
      } catch (err: any) {
        if (!err?.isNetworkError) {
          console.error('Failed to fetch categories', err);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('auth-change', checkAuth);

    checkAuth();
    fetchCategories();
    setMounted(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }

      if (
        userRef.current &&
        !userRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUserMenuOpen(false);
  };

  const handleSearch = (query: string = searchQuery) => {
    if (!query.trim()) return;

    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-neutral-100'
          : 'bg-white border-b border-neutral-100/70'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24 py-2 gap-2">

            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link
                href="/"
                aria-label="Zelvira Home"
                className="flex shrink-0 items-center pr-3 sm:pr-4 md:border-r md:border-neutral-200/80 md:mr-3 py-1 group"
              >
                <Image
                  src="/logo.png"
                  alt="Zelvira"
                  width={148}
                  height={37}
                  quality={60}
                  sizes="148px"
                  className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
                <Link
                  href="/products"
                  className="text-sm font-bold text-neutral-600 hover:text-pink-500 transition-colors"
                >
                  Explore
                </Link>

                <div
                  className="relative group"
                  onMouseEnter={() => setCategoriesHovered(true)}
                  onFocus={() => setCategoriesHovered(true)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-bold text-neutral-600 hover:text-pink-500 transition-colors py-4"
                  >
                    Categories
                    <ChevronDown
                      size={14}
                      className="group-hover:rotate-180 transition-transform"
                    />
                  </button>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/10 border border-neutral-100 p-6 min-w-[500px] grid grid-cols-2 gap-4">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.id}`}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all group/item border border-transparent hover:border-pink-100"
                        >
                          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-xl group-hover/item:scale-110 group-hover/item:bg-pink-50 transition-all">
                            {categoriesHovered && cat.imageUrl ? (
                              <Image
                                src={formatImageUrl(cat.imageUrl)}
                                alt={cat.name}
                                width={24}
                                height={24}
                                quality={60}
                                loading="lazy"
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              getCategoryIcon(cat.name)
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 group-hover/item:text-pink-500 transition-colors">
                              {cat.name}
                            </h4>
                            <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                              Shop Collection
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href="/deals"
                  className="text-sm font-bold text-neutral-600 hover:text-pink-500 transition-colors"
                >
                  Deals
                </Link>
              </nav>
            </div>

            {/* Desktop Search */}
            <div
              className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6 relative"
              ref={searchRef}
            >
              <div
                className={`relative w-full flex items-center transition-all duration-300 ${searchFocused ? 'ring-2 ring-pink-400' : ''
                  } bg-neutral-100 rounded-2xl`}
              >
                <Search
                  size={16}
                  className="absolute left-4 text-neutral-400"
                />

                <input
                  type="text"
                  placeholder="Search aesthetics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-[13px] text-neutral-800 placeholder-neutral-400 outline-none"
                />
              </div>

              <AnimatePresence>
                {searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-neutral-100 p-5 z-50"
                  >
                    <div className="flex items-center gap-2 mb-4 text-pink-500">
                      <Sparkles size={14} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider">
                        Trending Now
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSearch(suggestion)}
                          className="text-xs px-3 py-2 bg-neutral-50 border border-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-pink-50 hover:text-pink-600 hover:border-pink-100 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions: Desktop Icons + Mobile Search */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                aria-label="Cari produk"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-neutral-600 hover:text-pink-500 transition-colors"
              >
                {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Mobile Auth Quick Action */}
              {!mounted || !isLoggedIn ? (
                <Link
                  href="/login"
                  aria-label="Masuk ke Akun"
                  className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-bold shadow-sm shrink-0 ml-1 hover:bg-pink-600 transition-colors"
                >
                  <LogIn size={13} />
                  <span>Masuk</span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  aria-label={user?.fullName ? `Profil ${user.fullName}` : 'Profil Pengguna'}
                  className="md:hidden p-0.5 rounded-full border border-pink-200 ml-1 shrink-0"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs overflow-hidden shadow-xs">
                    {user?.profilePicture ? (
                      <img
                        src={formatImageUrl(user.profilePicture)}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                </Link>
              )}

              {/* Desktop Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden md:block"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2.5 text-neutral-600 hover:text-pink-500 transition-colors group cursor-pointer"
                >
                  <Heart
                    size={20}
                    className="group-hover:fill-pink-500 transition-all"
                  />

                  {wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </motion.div>
              </Link>

              {/* Desktop Cart */}
              <Link
                href="/cart"
                aria-label="Keranjang belanja"
                className="hidden md:block"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2.5 text-neutral-600 hover:text-pink-500 transition-colors group cursor-pointer"
                >
                  <ShoppingCart size={20} />

                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 min-w-4 h-4 px-0.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Desktop Account: Dynamic Login Button or Profile Dropdown */}
              {!mounted || !isLoggedIn ? (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-sm shrink-0 ml-2"
                >
                  <LogIn size={15} />
                  <span>Masuk</span>
                </Link>
              ) : (
                <div className="relative ml-1 sm:ml-2 hidden md:block" ref={userRef}>
                  <Link
                    href={mounted && isLoggedIn ? '/profile' : '/login'}
                    aria-label={mounted && isLoggedIn ? (user?.fullName ? `Profil ${user.fullName}` : 'Profil Pengguna') : 'Masuk atau Daftar Akun'}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => isLoggedIn && setUserMenuOpen(true)}
                      className="flex items-center gap-2 p-1 bg-neutral-50 rounded-full border border-neutral-100 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-br from-indigo-500 to-purple-600">
                        {user?.profilePicture ? (
                          <img
                            src={formatImageUrl(user.profilePicture)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                    </motion.div>
                  </Link>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/10 border border-neutral-100 overflow-hidden z-[110]"
                    >
                      <div className="p-6 bg-gradient-to-br from-neutral-50 to-pink-50/30">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                          Account
                        </p>

                        <h4 className="text-lg font-bold text-neutral-900 leading-tight">
                          {mounted
                            ? isLoggedIn
                              ? `Hello, ${user?.fullName || 'User'} ✨`
                              : 'Join zelvira 🌸'
                            : '...'}
                        </h4>

                        {!isLoggedIn && (
                          <Link
                            href="/login"
                            className="mt-4 block text-center text-xs font-semibold text-white bg-neutral-900 rounded-2xl py-3 hover:bg-pink-500 transition-colors shadow-lg shadow-neutral-200"
                          >
                            SIGN IN / JOIN
                          </Link>
                        )}
                      </div>

                      <div className="p-3 space-y-1">
                        {[
                          { icon: Package, label: 'My Orders', href: '/orders' },
                          { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                          { icon: MapPin, label: 'Addresses', href: '/addresses' },
                          { icon: Settings, label: 'Settings', href: '/profile' },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-neutral-50 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={18}
                                className="text-neutral-400 group-hover:text-pink-500"
                              />
                              <span className="text-[13px] font-bold text-neutral-600 group-hover:text-neutral-900">
                                {label}
                              </span>
                            </div>

                            <ChevronRight
                              size={14}
                              className="text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all"
                            />
                          </Link>
                        ))}

                        {isLoggedIn && (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-2 group"
                          >
                            <LogOut
                              size={18}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                            <span className="text-[13px] font-semibold uppercase tracking-wider">
                              Sign Out
                            </span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Mobile Search Panel */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative flex items-center bg-neutral-100 rounded-xl px-4"
              >
                <Search size={18} className="text-neutral-400" />

                <input
                  type="text"
                  autoFocus
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm outline-none pl-3"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="p-1 text-neutral-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              <div className="flex flex-wrap gap-2 mt-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSearch(suggestion)}
                    className="text-xs px-3 py-2 bg-neutral-50 border border-neutral-100 text-neutral-600 rounded-xl font-semibold hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-[110] lg:hidden"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[120] lg:hidden flex flex-col shadow-2xl"
              >
                <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center"
                  >
                    <img
                      src="/logo.png"
                      alt="Zelvira"
                      className="h-10 sm:h-12 w-auto max-w-[190px] object-contain drop-shadow-sm"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    aria-label="Tutup menu"
                    className="p-2 rounded-xl hover:bg-neutral-100"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8">


                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                      Menu Utama
                    </p>

                    <Link
                      href="/products"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2 text-base font-bold text-neutral-800 hover:text-pink-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Compass size={18} className="text-pink-500" />
                        <span>Explore Produk</span>
                      </div>
                      <ChevronRight size={18} className="text-neutral-400" />
                    </Link>

                    <Link
                      href="/categories"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2 text-base font-bold text-neutral-800 hover:text-pink-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutGrid size={18} className="text-pink-500" />
                        <span>Kategori Busana</span>
                      </div>
                      <ChevronRight size={18} className="text-neutral-400" />
                    </Link>

                    <Link
                      href="/deals"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2 text-base font-bold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Percent size={18} className="text-rose-500" />
                        <span>Exclusive Deals 🔥</span>
                      </div>
                      <ChevronRight size={18} className="text-neutral-400" />
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2 text-base font-bold text-neutral-800 hover:text-pink-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={18} className="text-neutral-500" />
                        <span>Keranjang Belanja</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-2 text-base font-bold text-neutral-800 hover:text-pink-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Heart size={18} className="text-neutral-500" />
                        <span>Wishlist Saya</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Akun
                    </p>

                    <Link
                      href={isLoggedIn ? '/profile' : '/login'}
                      onClick={closeMobileMenu}
                      aria-label={isLoggedIn ? 'Buka Profil Akun' : 'Masuk atau Daftar Akun'}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 hover:bg-pink-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center">
                        {user?.profilePicture ? (
                          <img
                            src={formatImageUrl(user.profilePicture)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900">
                          {isLoggedIn
                            ? user?.fullName || 'Akun Saya'
                            : 'Masuk / Daftar'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {isLoggedIn
                            ? 'Kelola akun Anda'
                            : 'Masuk untuk pengalaman belanja terbaik'}
                        </p>
                      </div>
                    </Link>

                    {isLoggedIn && (
                      <>
                        <Link
                          href="/orders"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 p-3 rounded-xl text-neutral-700 hover:bg-neutral-50"
                        >
                          <Package size={18} />
                          <span className="text-sm font-semibold">
                            Pesanan Saya
                          </span>
                        </Link>

                        <Link
                          href="/addresses"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 p-3 rounded-xl text-neutral-700 hover:bg-neutral-50"
                        >
                          <MapPin size={18} />
                          <span className="text-sm font-semibold">
                            Alamat
                          </span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-semibold">
                            Keluar
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-neutral-50 border-t border-neutral-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-neutral-200">
                      <Sparkles size={18} className="text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Support
                      </p>
                      <p className="text-sm font-bold text-neutral-900">
                        help@zelvira.id
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed top navbar */}
      <div className="h-16 sm:h-20 md:h-24" />

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[150] bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigasi utama mobile"
      >
        <div className="grid grid-cols-5 h-[64px]">
          {/* 1. Beranda */}
          <Link
            href="/"
            aria-current={isActive('/') ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/')
              ? 'text-pink-600'
              : 'text-neutral-500 hover:text-pink-500'
              }`}
          >
            {isActive('/') && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-pink-500" />
            )}

            <Home
              size={20}
              strokeWidth={isActive('/') ? 2.5 : 2}
            />

            <span className="text-[10px] font-bold">Beranda</span>
          </Link>

          {/* 2. Explore */}
          <Link
            href="/products"
            aria-current={isActive('/products') ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/products')
              ? 'text-pink-600'
              : 'text-neutral-500 hover:text-pink-500'
              }`}
          >
            {isActive('/products') && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-pink-500" />
            )}

            <Compass
              size={20}
              strokeWidth={isActive('/products') ? 2.5 : 2}
            />

            <span className="text-[10px] font-bold">Explore</span>
          </Link>

          {/* 3. Kategori */}
          <Link
            href="/categories"
            aria-current={isActive('/categories') ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/categories')
              ? 'text-pink-600'
              : 'text-neutral-500 hover:text-pink-500'
              }`}
          >
            {isActive('/categories') && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-pink-500" />
            )}

            <LayoutGrid
              size={20}
              strokeWidth={isActive('/categories') ? 2.5 : 2}
            />

            <span className="text-[10px] font-bold">Kategori</span>
          </Link>

          {/* 4. Deals */}
          <Link
            href="/deals"
            aria-current={isActive('/deals') ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/deals')
              ? 'text-pink-600'
              : 'text-neutral-500 hover:text-pink-500'
              }`}
          >
            {isActive('/deals') && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-pink-500" />
            )}

            <div className="relative">
              <Percent
                size={20}
                strokeWidth={isActive('/deals') ? 2.5 : 2}
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <span className="text-[10px] font-bold">Deals</span>
          </Link>

          {/* 5. Masuk / Profil */}
          <Link
            href={mounted ? (isLoggedIn ? '/profile' : '/login') : '/login'}
            aria-current={
              isActive('/profile') || isActive('/login')
                ? 'page'
                : undefined
            }
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/profile') ||
              isActive('/login') ||
              isActive('/orders') ||
              isActive('/addresses')
              ? 'text-pink-600'
              : 'text-neutral-500 hover:text-pink-500'
              }`}
          >
            {(isActive('/profile') ||
              isActive('/login') ||
              isActive('/orders') ||
              isActive('/addresses')) && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-pink-500" />
              )}

            {isLoggedIn ? (
              <div
                className={`w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center ${isActive('/profile')
                  ? 'ring-2 ring-pink-500 ring-offset-1'
                  : ''
                  }`}
              >
                {user?.profilePicture ? (
                  <img
                    src={formatImageUrl(user.profilePicture)}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    size={20}
                    strokeWidth={isActive('/profile') ? 2.5 : 2}
                  />
                )}
              </div>
            ) : (
              <LogIn
                size={20}
                strokeWidth={isActive('/login') ? 2.5 : 2}
              />
            )}

            <span className="text-[10px] font-bold">{isLoggedIn ? 'Profil' : 'Masuk'}</span>
          </Link>
        </div>
      </nav>

    </>
  );
}
