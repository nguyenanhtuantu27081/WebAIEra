import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import Breadcrumb from '@/components/ui/Breadcrumb';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isVi = locale === 'vi';
  return buildMetadata({
    title: isVi
      ? 'Liên hệ tư vấn Giải pháp AI & Fintech — AI Era'
      : 'Contact AI Era — AI & Fintech Solutions Consultation',
    description: isVi
      ? 'Kết nối với đội ngũ chuyên gia AI Era để được tư vấn đánh giá giải pháp AI Automation, AI Agent, Fintech và phần mềm doanh nghiệp.'
      : 'Get in touch with AI Era engineers and consultants for customized AI and enterprise digital transformation.',
    path: '/contact',
    locale,
  });
}

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const isVi = locale === 'vi';
  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: `/${locale}` },
    { name: isVi ? 'Liên hệ' : 'Contact', url: `/${locale}/contact` },
  ];

  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo/28 bg-indigo/8 text-indigo-2 font-mono text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-2 animate-pulse-glow" />
            CONNECT WITH US
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {isVi ? 'Liên hệ với AI Era' : 'Connect with AI Era'}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {isVi
              ? 'Đội ngũ kỹ sư và chuyên gia tư vấn của AI Era sẵn sàng giải đáp thắc mắc và đồng hành cùng chiến lược số hoá của bạn.'
              : 'Our engineering and advisory teams are ready to assist your digital transformation roadmap.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-4">{isVi ? 'Thông tin trực tiếp' : 'Direct Channels'}</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted block text-xs font-mono uppercase mb-1">Hotline / Zalo:</span>
                <a href="tel:+84977511663" className="text-lg font-bold text-indigo-2 hover:underline">
                  (+84) 977 511 663
                </a>
              </div>
              <div>
                <span className="text-muted block text-xs font-mono uppercase mb-1">Email chính thức:</span>
                <a href="mailto:info@aiera.vn" className="text-foreground font-medium hover:underline">
                  info@aiera.vn / contact@aiera.vn
                </a>
              </div>
              <div>
                <span className="text-muted block text-xs font-mono uppercase mb-1">Website:</span>
                <a href="https://aiera.vn" className="text-foreground font-medium hover:underline">
                  https://aiera.vn
                </a>
              </div>
              <div>
                <span className="text-muted block text-xs font-mono uppercase mb-1">Giờ làm việc:</span>
                <span className="text-muted">Thứ 2 – Thứ 7, 08:30 – 18:00 (Hỗ trợ 24/7 qua Zalo)</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-4">{isVi ? 'Tư vấn giải pháp nhanh' : 'Quick Inquiry'}</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              {isVi
                ? 'Để lại nhu cầu của doanh nghiệp hoặc liên hệ ngay qua Zalo để nhận tư vấn kiến trúc công nghệ miễn phí trong vòng 2 giờ.'
                : 'Send us your technical requirements or message directly via Zalo for a free architectural blueprint within 2 hours.'}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://zalo.me/0977511663"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-background font-semibold text-sm hover:bg-indigo-2 hover:text-background transition-colors"
              >
                Chat Zalo tư vấn ngay
              </a>
              <a
                href="mailto:contact@aiera.vn?subject=Tu%20van%20giai%20phap%20AI%20Era"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-muted font-medium text-sm hover:text-foreground hover:border-indigo/30 transition-all"
              >
                Gửi email yêu cầu đề xuất
              </a>
            </div>
          </GlassCard>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: isVi ? 'Trang chủ' : 'Home', url: `${siteConfig.url}/${locale}` },
            { name: isVi ? 'Liên hệ' : 'Contact', url: `${siteConfig.url}/${locale}/contact` },
          ])),
        }}
      />
    </div>
  );
}
