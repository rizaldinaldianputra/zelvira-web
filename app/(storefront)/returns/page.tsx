'use client';

import React from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-16">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Help Center
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <RefreshCcw size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Customer Satisfaction</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Return & Refund Policy
        </h1>
        <p className="text-neutral-500 font-medium">
          Not in love with your purchase? Don't worry, we're here to help you find the perfect aesthetic.
        </p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-12">
        <section className="bg-neutral-50 p-8 md:p-12 rounded-[3rem] border border-neutral-100">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-neutral-900">7-Day Return Window</h2>
          <p className="text-neutral-600 font-medium leading-relaxed">
            You have <strong>7 calendar days</strong> to return an item from the date you received it.
            To be eligible for a return, your item must be <strong>unused</strong> and in the same condition that you received it. 
            Your item must be in the <strong>original packaging</strong> with all tags attached.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} /> Eligible Items
            </h3>
            <ul className="space-y-2 text-sm text-emerald-600 font-medium list-disc pl-5">
              <li>Defective or damaged products</li>
              <li>Incorrect size or color received</li>
              <li>Product not as described</li>
              <li>Unopened beauty products</li>
            </ul>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-rose-50 border border-rose-100">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2 text-rose-700">
              <AlertCircle size={20} /> Non-Returnable
            </h3>
            <ul className="space-y-2 text-sm text-rose-600 font-medium list-disc pl-5">
              <li>Sale or clearance items</li>
              <li>Intimate apparel (underwear, swimwear)</li>
              <li>Personalized or custom items</li>
              <li>Items with missing original tags</li>
            </ul>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">How to Start a Return</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Request', desc: 'Contact our support with your order number.' },
              { step: 2, title: 'Pack', desc: 'Securely pack the items in original packaging.' },
              { step: 3, title: 'Ship', desc: 'Send the parcel to our return studio.' },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-[2rem] bg-white border border-neutral-100 text-center shadow-sm">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-black">
                  {s.step}
                </div>
                <h4 className="font-black uppercase tracking-tight text-neutral-900 mb-2">{s.title}</h4>
                <p className="text-xs text-neutral-500 font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-900 text-white p-8 md:p-12 rounded-[3rem] text-center relative overflow-hidden">
          <div className="relative z-10">
            <Heart size={32} className="text-pink-500 fill-pink-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Refund Process</h2>
            <p className="text-neutral-400 font-medium leading-relaxed max-w-xl mx-auto">
              Once we receive your item, we will inspect it and notify you that we have received your returned item. 
              If your return is approved, we will initiate a refund to your original method of payment within <strong>5-10 business days</strong>.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
        </section>
      </div>
    </div>
  );
}
