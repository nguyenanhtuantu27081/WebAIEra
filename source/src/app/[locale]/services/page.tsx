import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: locale === 'vi' 
      ? 'Dịch vụ & Giải pháp AI toàn diện — AI Era' 
      : 'AI Services & Enterprise Solutions — AI Era',
    description: locale === 'vi'
      ? 'Danh mục 6 nhóm giải pháp AI cốt lõi của AI Era: AI Automation, AI Agent, Phân tích định lượng Fintech, Thiết kế website SEO, Landing Page và Phần mềm doanh nghiệp.'
      : 'Comprehensive AI solutions by AI Era: AI Automation, AI Agents, Fintech Quantitative Analysis, SEO Web Design, Landing Pages, and Enterprise Software.',
    path: '/services',
    locale,
  });
}

const servicesList = [
  {
    slug: 'phan-tich-dinh-luong-chung-khoan',
    title: 'Phân tích định lượng chứng khoán',
    titleEn: 'Quantitative Stock Analysis',
    desc: 'Hệ thống phân tích định lượng dữ liệu thị trường, ứng dụng Machine Learning phát hiện tín hiệu dòng tiền, factor model và quản trị rủi ro khoa học cho nhà đầu tư.',
    descEn: 'Data-driven quantitative analysis, factor models, and ML algorithms for investment discipline and empirical alpha.',
    tag: 'Fintech & AI',
  },
  {
    slug: 'ai-automation-ai-agent',
    title: 'AI Automation & AI Agent',
    titleEn: 'AI Automation & AI Agent',
    desc: 'Tự động hoá quy trình tác vụ đa bước, kết nối các hệ thống ERP, CRM, và phát triển các AI Agent thông minh giải quyết bài toán chăm sóc khách hàng 24/7.',
    descEn: 'Intelligent workflow automation and autonomous AI agents designed to eliminate manual bottlenecks and scale throughput.',
    tag: 'Automation',
  },
  {
    slug: 'thiet-ke-website-chuan-seo',
    title: 'Thiết kế website chuẩn SEO & AI SEO',
    titleEn: 'SEO & AI Discovery Web Design',
    desc: 'Thiết kế website doanh nghiệp kiến trúc semantic-first, tối ưu Core Web Vitals dưới 1s và cấu trúc dữ liệu schema sẵn sàng cho AI Search (ChatGPT, Perplexity).',
    descEn: 'High-speed semantic web design optimized for Google top rankings and citation by modern generative AI engines.',
    tag: 'Web & AI SEO',
  },
  {
    slug: 'landing-page-hosting',
    title: 'Landing Page & Hosting',
    titleEn: 'Landing Page & Cloud Hosting',
    desc: 'Landing page tối ưu tỷ lệ chuyển đổi (CRO) phục vụ chiến dịch quảng cáo, tích hợp biểu mẫu thông minh, chatbot chốt sale và hạ tầng Cloud Hosting tốc độ cao.',
    descEn: 'Conversion-rate optimized landing pages with built-in cloud hosting, designed for high-ROI marketing campaigns.',
    tag: 'Marketing & Cloud',
  },
  {
    slug: 'digital-marketing-ai-content',
    title: 'Digital Marketing & AI Content',
    titleEn: 'Digital Marketing & AI Content',
    desc: 'Chiến dịch quảng cáo đa kênh (Meta, Google, TikTok) kết hợp nền tảng AI Content Hub tự động sản xuất và phân phối nội dung đa nền tảng nhất quán thương hiệu.',
    descEn: 'Omnichannel advertising backed by generative AI content pipelines for sustained growth and lower acquisition costs.',
    tag: 'Growth Marketing',
  },
  {
    slug: 'phan-mem-quan-ly-doanh-nghiep',
    title: 'Phần mềm quản lý doanh nghiệp ngành',
    titleEn: 'Enterprise Vertical Software',
    desc: 'Phần mềm quản lý may đo chuyên biệt cho từng mô hình: Spa, Thẩm mỹ viện, Phòng khám, Nha khoa, Gym, tích hợp AI dự báo tài chính và tự động hóa vận hành.',
    descEn: 'Specialized management SaaS tailored for vertical operations: Spa, Clinics, Dental, and Fitness centers.',
    tag: 'SaaS Solutions',
  },
];

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  const isVi = locale === 'vi';
  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: `/${locale}` },
    { name: isVi ? 'Dịch vụ' : 'Services', url: `/${locale}/services` },
  ];

  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo/28 bg-indigo/8 text-indigo-2 font-mono text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-2 animate-pulse-glow" />
            AI ERA SOLUTIONS HUB
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {isVi ? 'Hệ sinh thái Giải pháp AI & Công nghệ Doanh nghiệp' : 'Enterprise AI & Technology Solutions Ecosystem'}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {isVi
              ? 'Khám phá các giải pháp trí tuệ nhân tạo và công nghệ thực tiễn được AI Era may đo cho các lĩnh vực Tài chính, Fintech, Vận hành và Tăng trưởng thương mại.'
              : 'Explore cutting-edge applied AI and software solutions crafted by AI Era to drive operational efficiency and revenue growth.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {servicesList.map((srv) => (
            <Link key={srv.slug} href={`/${locale}/services/${srv.slug}`} className="group block">
              <GlassCard className="h-full flex flex-col justify-between transition-all duration-300 group-hover:border-indigo/40 group-hover:-translate-y-1 p-6">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-2 mb-3">
                    {srv.tag}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-3 group-hover:text-indigo-2 transition-colors">
                    {isVi ? srv.title : srv.titleEn}
                  </h2>
                  <p className="text-sm text-muted leading-relaxed mb-6">
                    {isVi ? srv.desc : srv.descEn}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/80 group-hover:text-indigo-2 transition-colors">
                  <span>{isVi ? 'Khám phá giải pháp' : 'Explore solution'}</span>
                  <span>→</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: isVi ? 'Trang chủ' : 'Home', url: `${siteConfig.url}/${locale}` },
            { name: isVi ? 'Dịch vụ' : 'Services', url: `${siteConfig.url}/${locale}/services` },
          ])),
        }}
      />
    </div>
  );
}
