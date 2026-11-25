'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Sparkles, Clock, CheckCircle2, ArrowRight, Tag } from 'lucide-react';
import { STYLE_CONFIG } from '@/services/style.config';
import Link from 'next/link';
import { Voucher } from '@/types/voucher';
import { VoucherService } from '@/services/voucher.service';
import { useToast } from '@/hooks/use-toast';

export default function VouchersPage() {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [claimedVouchers, setClaimedVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('BRONZE');
  const { toast } = useToast();

  const loadVouchers = async () => {
    try {
      setIsLoading(true);
      const [available, claimed] = await Promise.all([
        VoucherService.getAvailable(),
        VoucherService.getMyVouchers()
      ]);
      setAvailableVouchers(available);
      setClaimedVouchers(claimed);

      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('zelixa_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const points = user.points || 0;
            if (points >= 300) {
              setUserTier('PLATINUM');
            } else if (points >= 100) {
              setUserTier('GOLD');
            } else {
              setUserTier('BRONZE');
            }
          } catch (e) {
            console.error('Error parsing user state', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load vouchers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleClaim = async (code: string) => {
    try {
      await VoucherService.claim(code);
      toast({
        title: 'Success',
        description: `Voucher ${code} claimed successfully!`,
      });
      loadVouchers();
    } catch (error: any) {
      toast({
        title: 'Claim Failed',
        description: error.message || 'Could not claim this voucher.',
        variant: 'destructive',
      });
    }
  };

  // Combine claimed and available for display
  const allVouchersToDisplay = [
    ...claimedVouchers.map((cv) => ({
      ...cv.voucher,
      isClaimed: true,
      usageCount: cv.usageCount || 0
    })),
    ...availableVouchers.map((v) => ({
      ...v,
      isClaimed: false,
      usageCount: 0
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-500 text-xs font-black uppercase tracking-widest mb-6"
        >
          <Sparkles size={14} /> Rewards & Vouchers
        </motion.div>
        <h1 className="text-5xl font-black text-neutral-900 tracking-tight mb-4">
          Claim Your <span className="text-pink-500 italic">Style Perks</span>
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto font-medium">
          Unlock exclusive discounts, free shipping, and cashback rewards. Claim them now and they'll be ready at checkout.
          Your tier: <span className="font-bold text-pink-600">{userTier}</span>
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : allVouchersToDisplay.length === 0 ? (
        <div className="text-center py-20">
          <Ticket size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-600">No Vouchers Available</h3>
          <p className="text-neutral-400 text-sm mt-1">Check back later for new promotional codes!</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allVouchersToDisplay.map((v, i) => {
            const isGoldVoucher = v.targetMembership === 'GOLD';
            const isPlatinumVoucher = v.targetMembership === 'PLATINUM';
            const isBronzeVoucher = v.targetMembership === 'BRONZE';
            
            // Check eligibility in UI
            let isEligible = true;
            if (isGoldVoucher && userTier === 'BRONZE') isEligible = false;
            if (isPlatinumVoucher && userTier !== 'PLATINUM') isEligible = false;

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative bg-white rounded-[2.5rem] border border-neutral-100 p-8 shadow-xl shadow-black/5 overflow-hidden transition-all duration-500 ${
                  !isEligible && !v.isClaimed ? 'opacity-60 saturate-50' : 'hover:shadow-pink-200/20'
                }`}
              >
                {/* Background Blob */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: STYLE_CONFIG.primary }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      v.isClaimed ? 'bg-green-500 text-white' : 'bg-pink-500 text-white'
                    }`}>
                      {v.isClaimed ? <CheckCircle2 size={28} /> : <Ticket size={28} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                        <Tag size={12} /> {v.targetMembership || 'ALL'}
                      </span>
                      {v.isClaimed && (
                        <span className="text-[10px] font-bold text-neutral-400">
                          Used: {v.usageCount} times
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-neutral-900 mb-2 leading-tight">
                    Discount: Rp {v.discountAmount.toLocaleString()}
                  </h3>
                  <p className="text-sm text-neutral-500 font-medium mb-6 leading-relaxed">
                    Min. Purchase: Rp {v.minPurchase.toLocaleString()}
                    <br />
                    Code: <span className="font-bold tracking-widest text-pink-600">{v.code}</span>
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                        Valid Until
                      </p>
                      <p className="text-sm font-black text-neutral-900">
                        {v.validUntil ? new Date(v.validUntil).toLocaleDateString() : '-'}
                      </p>
                    </div>

                    {v.isClaimed ? (
                      <span className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-green-500 text-white shadow-lg shadow-green-100 flex items-center gap-2">
                        Claimed <CheckCircle2 size={14} />
                      </span>
                    ) : !isEligible ? (
                      <span className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-neutral-100 text-neutral-400 border border-neutral-200">
                        Locked ({v.targetMembership})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaim(v.code)}
                        className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
                      >
                        Claim Now <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-20 text-center">
        <p className="text-sm text-neutral-400 font-medium">
          Want more rewards? Follow our{' '}
          <Link href="#" className="underline font-bold text-neutral-500 hover:text-pink-500 transition-colors">
            Instagram
          </Link>{' '}
          for weekly surprise drops.
        </p>
      </div>
    </div>
  );
}
