import { Suspense } from 'react';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import SeoScript from '@/components/storefront/SeoScript';
import ProductsClient from '@/components/storefront/ProductsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Katalog Busana & Gaya Hidup | Zelvira',
  description: 'Eksplorasi koleksi busana muslim, gamis modern, hijab premium, dan aksesoris eksklusif dari Zelvira.',
};

export default function ProductsPage() {
  return (
    <>
      <SeoScript pageName="PRODUCT_LIST" />
      <Suspense fallback={
        <div className="min-h-screen flex justify-center items-center">
          <Loader2 className="animate-spin text-pink-500" size={40} />
        </div>
      }>
        <ProductsClient />
      </Suspense>
    </>
  );
}
