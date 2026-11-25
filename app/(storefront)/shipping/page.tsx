'use client';

import React from 'react';
import { Truck, Clock, Globe, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-16">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Help Center
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <Truck size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logistics & Delivery</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Shipping Policy
        </h1>
        <p className="text-neutral-500 font-medium">
          Everything you need to know about how we deliver your favorite aesthetics to your doorstep.
        </p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-12">
        <section className="bg-neutral-50 p-8 md:p-12 rounded-[3rem] border border-neutral-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
              <Clock size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight m-0 text-neutral-900">Processing Time</h2>
          </div>
          <p className="text-neutral-600 font-medium leading-relaxed">
            All orders are processed within <strong>1-2 business days</strong>. Orders are not shipped or delivered on weekends or holidays.
            If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-100/30">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Globe size={20} className="text-pink-500" /> Domestic Shipping
            </h3>
            <ul className="space-y-3 text-sm text-neutral-500 font-medium list-none p-0 m-0">
              <li className="flex justify-between py-2 border-b border-neutral-50">
                <span>Standard (JNE/J&T)</span>
                <span className="font-bold text-neutral-900">2-4 Days</span>
              </li>
              <li className="flex justify-between py-2 border-b border-neutral-50">
                <span>Express (SiCepat Best)</span>
                <span className="font-bold text-neutral-900">1-2 Days</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Instant (Gojek/Grab)</span>
                <span className="font-bold text-neutral-900">3-6 Hours</span>
              </li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-100/30">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
              <Sparkles size={20} className="text-pink-500" /> Free Shipping
            </h3>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed">
              We offer <strong>Free Standard Shipping</strong> on all domestic orders over <strong>Rp 500.000</strong>.
              Free shipping is automatically applied at checkout when the threshold is met.
            </p>
          </section>
        </div>

        <section className="bg-neutral-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-neutral-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pink-400 border border-white/10">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight m-0">Order Tracking</h2>
          </div>
          <p className="text-neutral-400 font-medium leading-relaxed mb-6">
            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). 
            The tracking number will be active within 24 hours.
          </p>
          <Link href="/orders" className="inline-flex items-center gap-2 text-pink-400 font-black text-xs uppercase tracking-[0.2em] hover:text-pink-300 transition-colors">
            Track your order now <Clock size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
