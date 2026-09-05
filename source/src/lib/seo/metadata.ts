import { Metadata } from 'next';

export const siteConfig = {
  name: 'AIERA Solutions',
  description: 'AIERA (AI Era Solutions) cung cấp các giải pháp AI, Fintech, AI Automation, AI Agent, AI SEO và Digital Marketing toàn diện cho doanh nghiệp Việt Nam tại aiera.vn.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn'}/og-image.jpg`,
  creator: 'AIERA Solutions',
  keywords: ['aiera', 'aiera solutions', 'ai era', 'ai era solutions', 'aiera vn', 'aiera.vn'],
};

export const generateMetadata = ({
  title,
  description,
  path = '',
  ogImage,
  locale = 'vi',
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  locale?: string;
}): Metadata => {
  const url = `${siteConfig.url}/${locale}${path}`;
  const image = ogImage || siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteConfig.url}/en${path}`,
        vi: `${siteConfig.url}/vi${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
};
