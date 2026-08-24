import type { Metadata } from 'next';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Era',
  url: 'https://ai-era.vn',
  logo: 'https://ai-era.vn/logo.png',
  description: 'AI Era cung cấp các giải pháp AI và digital marketing toàn diện cho doanh nghiệp Việt Nam.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Vietnamese', 'English'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Era',
  url: 'https://ai-era.vn',
  description: 'AI Era — Intelligence in motion. Giải pháp AI và digital marketing toàn diện.',
  inLanguage: ['vi', 'en'],
};

export const serviceSchema = (data: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: data.name,
  description: data.description,
  provider: {
    '@type': 'Organization',
    name: 'AI Era',
    url: 'https://ai-era.vn',
  },
  url: data.url,
});

export const softwareApplicationSchema = (data: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: data.name,
  description: data.description,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  provider: {
    '@type': 'Organization',
    name: 'AI Era',
    url: 'https://ai-era.vn',
  },
  url: data.url,
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
