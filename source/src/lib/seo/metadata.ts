import { Metadata } from 'next';

export const siteConfig = {
  name: 'AI Era',
  description: 'AI Era cung cấp các giải pháp AI và digital marketing toàn diện cho doanh nghiệp Việt Nam.',
  url: 'https://ai-era.vn',
  ogImage: 'https://ai-era.vn/og-image.jpg',
  creator: 'AI Era',
};

export const generateMetadata = ({
  title,
  description,
  path = '',
  ogImage,
  locale = 'en',
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
