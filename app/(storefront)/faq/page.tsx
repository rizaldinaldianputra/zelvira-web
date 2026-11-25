'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { FaqService, Faq } from '@/services/faq.service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await FaqService.getActive();
        setFaqs(response.content || []);
      } catch (err) {
        console.error('Failed to fetch FAQs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Help Center
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <HelpCircle size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Base</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-neutral-500 font-medium">
          Have a question? We've got answers. If you can't find what you're looking for, please contact our support team.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-neutral-50 border border-neutral-100 rounded-3xl outline-none focus:ring-4 focus:ring-pink-500/5 focus:border-pink-500/20 transition-all font-medium text-lg"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-pink-500" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Loading FAQs...</p>
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-3xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-pink-500/20 bg-pink-50/20 ring-4 ring-pink-500/5' : 'border-neutral-100 bg-white hover:border-neutral-200'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60">
                    {faq.category}
                  </span>
                  <span className={`text-lg font-bold tracking-tight transition-colors ${openIndex === index ? 'text-pink-600' : 'text-neutral-900'}`}>
                    {faq.question}
                  </span>
                </div>
                <div className={`p-2 rounded-xl transition-all ${openIndex === index ? 'bg-pink-500 text-white rotate-180' : 'bg-neutral-50 text-neutral-400 group-hover:bg-neutral-100'}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-8 text-neutral-600 font-medium leading-relaxed prose prose-neutral max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search size={24} className="text-neutral-300" />
          </div>
          <h3 className="text-xl font-black uppercase text-neutral-900 tracking-tight">No results found</h3>
          <p className="text-neutral-500 font-medium mt-2">Try adjusting your search terms or contact support.</p>
        </div>
      )}

      {/* Categories footer */}
      <div className="mt-20 pt-10 border-t border-neutral-100 flex flex-wrap justify-center gap-3">
        {Array.from(new Set(faqs.map(f => f.category))).map(cat => (
          <button
            key={cat}
            onClick={() => setSearchQuery(cat)}
            className="px-6 py-2.5 rounded-full bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:bg-pink-500 hover:text-white transition-all"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
