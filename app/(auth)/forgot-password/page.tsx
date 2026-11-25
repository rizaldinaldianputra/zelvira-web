'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { STYLE_CONFIG } from '@/services/style.config';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

type Step = 'email' | 'otp' | 'new-password' | 'success';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend OTP countdown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [resendCooldown]);

  // Step 1: Request OTP via Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const msg = await authService.requestForgotPasswordOtp(email);
      toast({
        title: 'Kode OTP Terkirim',
        description: msg || 'Kode verifikasi telah dikirim ke email Anda.',
      });
      setResendCooldown(60);
      setStep('otp');
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengirim kode OTP. Pastikan email terdaftar.';
      setErrorMessage(msg);
      toast({
        title: 'Gagal Meminta OTP',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input & auto-focus
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input if filled
    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pasted.length, 5);
    const targetInput = document.getElementById(`otp-${focusIdx}`);
    targetInput?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Silakan masukkan 6 digit kode OTP verifikasi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const msg = await authService.verifyForgotPasswordOtp(email, otpCode);
      toast({
        title: 'Verifikasi Berhasil',
        description: msg || 'Kode OTP valid. Silakan masukkan kata sandi baru.',
      });
      setStep('new-password');
    } catch (err: any) {
      const msg = err?.message || 'Kode OTP salah atau sudah kedaluwarsa.';
      setErrorMessage(msg);
      toast({
        title: 'Verifikasi Gagal',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const msg = await authService.requestForgotPasswordOtp(email);
      toast({
        title: 'OTP Baru Terkirim',
        description: msg || 'Kode OTP baru telah dikirim ke email Anda.',
      });
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengirim ulang OTP.';
      setErrorMessage(msg);
      toast({
        title: 'Gagal Mengirim Ulang',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const otpCode = otp.join('');
      const msg = await authService.resetPasswordWithOtp(email, otpCode, newPassword);
      toast({
        title: 'Kata Sandi Berhasil Diperbarui',
        description: msg || 'Kata sandi akun Anda telah berhasil diubah.',
      });
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengatur ulang kata sandi.';
      setErrorMessage(msg);
      toast({
        title: 'Gagal Mengubah Kata Sandi',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background font-sans">
      {/* Left Side: Brand Visuals */}
      <div
        className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden"
        style={{ background: STYLE_CONFIG.gradients.primary }}
      >
        <div className="absolute inset-0 opacity-20 text-white pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 text-center text-white"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <ShieldCheck size={40} className="text-white fill-white/20" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic">Secure</h1>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-4 opacity-90">Account Recovery</h2>
          <p className="max-w-md mx-auto text-white/70 font-bold leading-relaxed">
            Keamanan akun Anda adalah prioritas kami. Ikuti langkah sederhana untuk memulihkan akses dan kembali menikmati pengalaman belanja premium.
          </p>
        </motion.div>
      </div>

      {/* Right Side: Step-by-Step Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        {/* Back Link */}
        <div className="absolute top-8 left-8 lg:left-12">
          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/20 transition-all shadow-sm">
              <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Kembali ke Login</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: EMAIL INPUT */}
          {step === 'email' && (
            <motion.div
              key="email"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <div className="mb-8 text-center lg:text-left">
                <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/40 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <Mail size={24} className="text-pink-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-3">
                  Lupa Kata Sandi?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Jangan khawatir! Masukkan alamat email Anda dan kami akan mengirimkan 6-digit kode verifikasi untuk mereset kata sandi.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in duration-200">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl outline-none focus:ring-2 ring-pink-400 focus:bg-white dark:focus:bg-slate-900 text-foreground transition-all text-sm font-semibold shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl shadow-pink-100 dark:shadow-pink-950/20 hover:shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(45deg, ${STYLE_CONFIG.primary}, ${STYLE_CONFIG.accent})` }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Mengirim Kode...</span>
                    </div>
                  ) : (
                    <>
                      Kirim Kode Verifikasi <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md text-center lg:text-left"
            >
              <div className="mb-8">
                <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/40 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <ShieldCheck size={24} className="text-pink-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-3">
                  Periksa Email Anda
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Kami telah mengirimkan 6 digit kode verifikasi ke{' '}
                  <span className="text-pink-600 dark:text-pink-400 font-black">{email}</span>.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in duration-200">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl font-black bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-pink-400 focus:bg-white dark:focus:bg-slate-900 text-foreground transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl shadow-pink-100 dark:shadow-pink-950/20 hover:shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(45deg, ${STYLE_CONFIG.primary}, ${STYLE_CONFIG.accent})` }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Memverifikasi...</span>
                    </div>
                  ) : (
                    <>
                      Verifikasi Kode <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setErrorMessage(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    Ubah Alamat Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="flex items-center gap-1.5 text-pink-500 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                  >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang OTP'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'new-password' && (
            <motion.div
              key="new-password"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <div className="mb-8 text-center lg:text-left">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <KeyRound size={24} className="text-indigo-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-3">
                  Buat Kata Sandi Baru
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                  Langkah terakhir! Buat kata sandi baru yang kuat (minimal 6 karakter) untuk mengamankan akun Anda.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in duration-200">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
                    Kata Sandi Baru
                  </label>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl outline-none focus:ring-2 ring-pink-400 focus:bg-white dark:focus:bg-slate-900 text-foreground transition-all text-sm font-semibold shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors"
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl outline-none focus:ring-2 ring-pink-400 focus:bg-white dark:focus:bg-slate-900 text-foreground transition-all text-sm font-semibold shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl shadow-pink-100 dark:shadow-pink-950/20 hover:shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(45deg, ${STYLE_CONFIG.primary}, ${STYLE_CONFIG.accent})` }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Memperbarui Kata Sandi...</span>
                    </div>
                  ) : (
                    <>
                      Simpan Kata Sandi Baru <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <motion.div
              key="success"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md text-center"
            >
              <div className="mb-10">
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-3">
                  Semua Beres! 🎉
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                  Kata sandi akun Anda telah berhasil diperbarui. Silakan masuk kembali menggunakan kata sandi baru Anda.
                </p>
              </div>

              <Link href="/login" className="block w-full">
                <button
                  className="w-full py-4 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl shadow-pink-100 dark:shadow-pink-950/20 hover:shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 group overflow-hidden"
                  style={{ background: STYLE_CONFIG.gradients.primary }}
                >
                  Masuk Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
