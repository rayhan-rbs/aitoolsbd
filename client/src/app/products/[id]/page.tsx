import type { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductClient from './ProductClient';

// 🔥 Next.js 15/16: params একটি Promise, তাই এটি await করতে হবে
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; // ✅ এখানে await করা হয়েছে

  const { data: product } = await supabase
    .from('products')
    .select('title, description, preview_url, category, price')
    .eq('id', id)
    .eq('is_approved', true)
    .single();

  if (!product) {
    return {
      title: 'প্রোডাক্ট পাওয়া যায়নি',
      robots: { index: false, follow: false }
    };
  }

  const shortDesc = product.description ? product.description.slice(0, 160) : `AIToolsBD থেকে ${product.title} কিনুন। মূল্য: ৳${product.price}।`;

  return {
    title: `${product.title} - ৳${product.price}`,
    description: shortDesc,
    openGraph: {
      title: product.title,
      description: shortDesc,
      images: product.preview_url ? [{ url: product.preview_url }] : [],
      type: 'website', // 🔥 'product' এর বদলে 'website' করা হয়েছে যাতে Next.js এরর না দেয়
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: shortDesc,
      images: product.preview_url ? [product.preview_url] : [],
    }
  };
}

// 🔥 Next.js 15/16: এখানেও params await করতে হবে
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ এখানে await করা হয়েছে
  
  return <ProductClient productId={id} />;
}