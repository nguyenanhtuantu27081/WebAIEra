import { siteConfig } from './metadata';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Era',
  alternateName: ['AI Era Solution', 'AI Era VN'],
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  image: `${siteConfig.url}/logo.png`,
  description: 'AI Era cung cấp các giải pháp AI, Fintech, AI Automation, AI Agent, phân tích định lượng chứng khoán và digital marketing toàn diện cho doanh nghiệp Việt Nam.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@aiera.vn',
    contactType: 'customer service',
    availableLanguage: ['Vietnamese', 'English'],
  },
  sameAs: [
    'https://www.facebook.com/aiera.vn',
    'https://zalo.me/0977511663',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Era',
  alternateName: 'AI Era Solution',
  url: siteConfig.url,
  description: 'AI Era — Nền tảng giải pháp AI thế hệ mới. Trí tuệ cho mọi quyết định kinh doanh.',
  inLanguage: ['vi', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/vi/tim-kiem?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
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
    url: siteConfig.url,
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
    url: siteConfig.url,
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
