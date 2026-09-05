import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'Thiết kế Landing Page & Miễn phí Hosting — AI Era',
    description: 'Thiết kế landing page chuyên dụng cho chiến dịch quảng cáo, kết hợp gói hosting miễn phí giúp doanh nghiệp triển khai nhanh chóng.',
    path: '/services/landing-page-hosting',
    locale,
  });
}

export default function LandingPageHostingPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Thiết kế Landing Page & Miễn phí Hosting
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era thiết kế landing page chuyên dụng cho chiến dịch quảng cáo, ra mắt sản phẩm, thu thập lead hoặc khuyến mãi, kết hợp gói hosting miễn phí giúp doanh nghiệp triển khai nhanh chóng mà không phải lo về hạ tầng.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Thiết kế Landing Page</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Thiết kế theo mục tiêu chuyển đổi</h3>
              <p className="text-sm text-muted leading-relaxed">
                Mỗi landing page được thiết kế xoay quanh một mục tiêu duy nhất: đăng ký, tải xuống, liên hệ hay mua hàng. Layout, màu sắc, hình ảnh và CTA được tối ưu để hướng người dùng đến hành động mục tiêu.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tối ưu tốc độ & trải nghiệm</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tối ưu hình ảnh, code và cấu trúc trang để landing page tải nhanh, giảm tỷ lệ thoát và tăng chất lượng điểm Quality Score trên Google Ads, Meta Ads.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tương thích đa thiết bị</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế responsive đảm bảo trải nghiệm tốt trên điện thoại, máy tính bảng và desktop — nơi người dùng thường xuyên tiếp cận quảng cáo.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">A/B testing & cải tiến</h3>
              <p className="text-sm text-muted leading-relaxed">
                Hỗ trợ thiết kế phiên bản thử nghiệm (A/B) để so sánh tiêu đề, hình ảnh, CTA và tối ưu dựa trên dữ liệu thực tế.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Miễn phí Hosting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Hạ tầng ổn định</h3>
              <p className="text-sm text-muted leading-relaxed">
                Cung cấp hosting ổn định với uptime cao, hỗ trợ HTTPS, sao lưu tự động và bảo mật cơ bản, giúp landing page hoạt động liên tục trong suốt chiến dịch.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tích hợp nhanh</h3>
              <p className="text-sm text-muted leading-relaxed">
                Hỗ trợ triển khai landing page lên hosting chỉ trong thời gian ngắn, tích hợp sẵn với tên miền, SSL và công cụ theo dõi khi cần.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Không phụ thuộc nền tảng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Bạn sở hữu toàn bộ landing page và dữ liệu, không bị khóa trong nền tảng bên thứ ba, dễ dàng chuyển đổi hoặc nâng cấp khi cần.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Khi nào nên dùng Landing Page riêng?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Chiến dịch quảng cáo</h3>
              <p className="text-sm text-muted leading-relaxed">
                Triển khai chiến cáo Meta, Google Ads, TikTok Ads với trang đích riêng để tối ưu chuyển đổi.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Ra mắt sản phẩm mới</h3>
              <p className="text-sm text-muted leading-relaxed">
                Giới thiệu sản phẩm hoặc dịch vụ mới với trang riêng tập trung vào một thông điệp mạnh.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Thu thập lead</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thu thập lead từ chương trình khuyến mãi, sự kiện hoặc chiến dịch marketing có mục tiêu rõ ràng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Đối tượng cụ thể</h3>
              <p className="text-sm text-muted leading-relaxed">
                Hướng đến một đối tượng khách hàng cụ thể (targeted audience) với nội dung và ưu đãi phù hợp.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Dự án tiêu biểu</h2>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-3">
              <a
                href="https://arabeautycenter.com/"
                target="_blank"
                rel="noopener"
                className="text-indigo hover:text-indigo-2 transition-colors"
              >
                ARA Beauty Center
              </a>
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              AI Era thiết kế landing page và triển khai hosting cho{' '}
              <a
                href="https://arabeautycenter.com/"
                target="_blank"
                rel="noopener"
                className="text-indigo hover:text-indigo-2 transition-colors"
              >
                ARA Beauty Center
              </a>
              , tối ưu tốc độ tải, form thu lead và trải nghiệm chuyển đổi cho landing page ngành spa & thẩm mỹ.
            </p>
          </GlassCard>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn cần thiết kế landing page chuyên nghiệp và tìm hosting phù hợp? Liên hệ AI Era để nhận đề xuất thiết kế và triển khai nhanh chóng.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/digital-marketing-ai-content" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Digital Marketing & AI Content →
            </Link>
            <Link href="/services/thiet-ke-website-chuan-seo" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Thiết kế website chuẩn SEO →
            </Link>
            <Link href="/services/ai-automation-ai-agent" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              AI Automation & AI Agent →
            </Link>
          </div>
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: 'Thiết kế Landing Page & Miễn phí Hosting',
            description: 'Thiết kế landing page chuyên dụng kết hợp gói hosting miễn phí.',
            url: `https://ai-era.vn/${locale}/services/landing-page-hosting`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'Landing Page & Hosting', url: `https://ai-era.vn/${locale}/services/landing-page-hosting` },
          ])),
        }}
      />
    </div>
  );
}
