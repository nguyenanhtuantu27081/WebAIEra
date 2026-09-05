import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CTA from '@/components/sections/CTA';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isVi = locale === 'vi';
  return buildMetadata({
    title: isVi
      ? 'Về chúng tôi — AI Era (AI Era Solution)'
      : 'About Us — AI Era (AI Era Solution)',
    description: isVi
      ? 'AI Era (tên đầy đủ: AI Era Solution) là công ty giải pháp công nghệ tiên phong ứng dụng AI trong đa lĩnh vực: Fintech, tài chính, bảo hiểm, tự động hoá và phần mềm doanh nghiệp.'
      : 'AI Era (AI Era Solution) is a pioneer in delivering applied Artificial Intelligence across Fintech, finance, automation, and enterprise software.',
    path: '/about',
    locale,
  });
}

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const isVi = locale === 'vi';
  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: `/${locale}` },
    { name: isVi ? 'Về chúng tôi' : 'About Us', url: `/${locale}/about` },
  ];

  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo/28 bg-indigo/8 text-indigo-2 font-mono text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-2 animate-pulse-glow" />
            ABOUT AI ERA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {isVi ? 'Định hình tương lai với Giải pháp AI Thực tiễn' : 'Empowering Business with Practical Artificial Intelligence'}
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-6">
            {isVi ? (
              <>
                <strong>AI Era</strong> (tên đầy đủ: <strong>AI Era Solution</strong>) là đơn vị công nghệ tập trung vào việc nghiên cứu, phát triển và ứng dụng thực tiễn Trí tuệ Nhân tạo (AI) vào lõi vận hành của doanh nghiệp. Chúng tôi tin rằng AI không chỉ là công nghệ trình diễn, mà là công cụ kiến tạo tăng trưởng doanh thu và chuẩn hoá quy trình cho mọi tổ chức.
              </>
            ) : (
              <>
                <strong>AI Era</strong> (officially <strong>AI Era Solution</strong>) develops and deploys actionable Artificial Intelligence solutions deeply integrated into core enterprise operations, transforming complex data into empirical competitive advantage.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="p-6">
            <div className="text-2xl font-bold text-indigo-2 mb-2">01</div>
            <h2 className="text-base font-semibold mb-2">{isVi ? 'Định hướng Giá trị' : 'Value-Driven'}</h2>
            <p className="text-sm text-muted leading-relaxed">
              {isVi ? 'Mọi thuật toán và giải pháp đều đo lường bằng hiệu quả kinh doanh, ROI và thời gian tiết kiệm thực tế.' : 'Every solution is measured by quantifiable business metrics and empirical ROI.'}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-2xl font-bold text-indigo-2 mb-2">02</div>
            <h2 className="text-base font-semibold mb-2">{isVi ? 'Đa lĩnh vực & Fintech' : 'Multi-Industry & Fintech'}</h2>
            <p className="text-sm text-muted leading-relaxed">
              {isVi ? 'Chuyên sâu giải quyết bài toán ngành thâm dụng dữ liệu: Tài chính, Ngân hàng, Bảo hiểm, Fintech và SaaS.' : 'Deep expertise across high-data industries: Finance, Insurance, Quantitative Fintech, and SaaS.'}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-2xl font-bold text-indigo-2 mb-2">03</div>
            <h2 className="text-base font-semibold mb-2">{isVi ? 'Bảo mật & Tự chủ' : 'Security & Ownership'}</h2>
            <p className="text-sm text-muted leading-relaxed">
              {isVi ? 'Khách hàng toàn quyền sở hữu mã nguồn, dữ liệu và mô hình đào tạo riêng, bảo mật chuẩn doanh nghiệp.' : 'Enterprises retain full ownership of models, codebases, and sensitive business intelligence.'}
            </p>
          </GlassCard>
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: isVi ? 'Trang chủ' : 'Home', url: `${siteConfig.url}/${locale}` },
            { name: isVi ? 'Về chúng tôi' : 'About Us', url: `${siteConfig.url}/${locale}/about` },
          ])),
        }}
      />
    </div>
  );
}
