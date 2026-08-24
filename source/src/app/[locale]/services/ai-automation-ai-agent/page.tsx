import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'AI Automation & AI Agent — AI Era',
    description: 'Giải pháp AI Automation và triển khai AI Agent theo yêu cầu, giúp doanh nghiệp tự động hóa quy trình lặp lại và nâng cao hiệu suất nhân sự.',
    path: '/services/ai-automation-ai-agent',
    locale,
  });
}

export default function AiAutomationPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          AI Automation & AI Agent
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era cung cấp giải pháp AI Automation và triển khai AI Agent theo yêu cầu, giúp doanh nghiệp tự động hóa quy trình lặp lại, nâng cao hiệu suất nhân sự và mở rộng quy mô vận hành mà không cần gia tăng chi phí nhân lực tương ứng.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">AI Automation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tự động hóa quy trình nghiệp vụ</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế và tích hợp các luồng công việc tự động giữa các công cụ, hệ thống và nền tảng doanh nghiệp đang sử dụng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tích hợp hệ thống</h3>
              <p className="text-sm text-muted leading-relaxed">
                Kết nối dữ liệu và tương tác giữa các phần mềm quản lý, CRM, ERP, nền tảng bán hàng và kênh marketing.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tự động hóa có giám sát</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết lập quy trình tự động có điểm kiểm soát của con người, đảm bảo chất lượng đầu ra và tuân thủ quy định.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">AI Agent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Agent hỗ trợ khách hàng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Triển khai agent thông minh xử lý tư vấn, giải đáp thắc mắc và hỗ trợ khách hàng 24/7.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Agent xử lý nghiệp vụ phức tạp</h3>
              <p className="text-sm text-muted leading-relaxed">
                Phát triển agent có khả năng lập kế hoạch, dùng công cụ, cập nhật trạng thái và thực thi chuỗi thao tác nhiều bước.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Agent đa kênh</h3>
              <p className="text-sm text-muted leading-relaxed">
                Triển khai agent hoạt động nhất quán trên nhiều kênh tiếp xúc, duy trì ngữ cảnh và trải nghiệm liền mạch.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Lợi ích khi triển khai cùng AI Era</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tăng tốc vận hành</h3>
              <p className="text-sm text-muted leading-relaxed">
                Giảm thời gian xử lý thủ công, nâng cao throughput của đội ngũ.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Giảm chi phí</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tự động hóa quy trình lặp lại giúp tái phân bổ nguồn lực sang công việc chiến lược.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Mở rộng linh hoạt</h3>
              <p className="text-sm text-muted leading-relaxed">
                Hệ thống tự động và agent có thể xử lý khối lượng công việc lớn mà không cần tuyển thêm nhân sự tuyến đầu.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Dữ liệu tập trung</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tất cả thao tác đều có log, dễ theo dõi, đối chiếu và tối ưu liên tục.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn đang tìm giải pháp tự động hóa quy trình hoặc triển khai AI Agent cho doanh nghiệp? Liên hệ với AI Era để được đánh giá nhu cầu và đề xuất giải pháp phù hợp.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/phan-tich-dinh-luong-chung-khoan" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Phân tích định lượng chứng khoán →
            </Link>
            <Link href="/services/thiet-ke-website-chuan-seo" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Thiết kế website chuẩn SEO →
            </Link>
            <Link href="/services/digital-marketing-ai-content" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Digital Marketing & AI Content →
            </Link>
          </div>
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: 'AI Automation & AI Agent',
            description: 'Giải pháp AI Automation và triển khai AI Agent theo yêu cầu doanh nghiệp.',
            url: `https://ai-era.vn/${locale}/services/ai-automation-ai-agent`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'AI Automation & AI Agent', url: `https://ai-era.vn/${locale}/services/ai-automation-ai-agent` },
          ])),
        }}
      />
    </div>
  );
}
