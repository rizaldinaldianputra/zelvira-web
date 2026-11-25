'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { authService } from '@/services/auth.service';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(values);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                      placeholder="John Doe"
                      className="bg-white/50 border-slate-100 pl-11 h-12 rounded-2xl focus:ring-pink-50 transition-all font-medium"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                      placeholder="you@example.com"
                      className="bg-white/50 border-slate-100 pl-11 h-12 rounded-2xl focus:ring-pink-50 transition-all font-medium"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/50 border-slate-100 pl-11 h-12 rounded-2xl focus:ring-pink-50 transition-all font-medium"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transition-all rounded-3xl font-black uppercase tracking-widest text-xs mt-2 shadow-xl shadow-pink-100"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </Form>

      {/* Google Sign In Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-wider">
            atau daftar dengan
          </span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <GoogleSignInButton
        onSuccess={() => {
          router.push('/');
          router.refresh();
        }}
        onError={(err: any) => {
          setError(err?.message || 'Gagal mendaftar dengan akun Google.');
        }}
        text="signup_with"
        label="Daftar dengan Google"
      />

      <div className="text-center pt-2">
        <p className="text-sm font-bold text-slate-400">
          Already have an account? {' '}
          <Link href="/login" className="text-slate-900 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors font-black uppercase text-xs tracking-tighter">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
