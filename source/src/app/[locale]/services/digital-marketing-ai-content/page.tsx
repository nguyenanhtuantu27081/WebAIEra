import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'Digital Marketing & AI Content đa nền tảng — AI Era',
    description: 'Dịch vụ digital marketing toàn diện, kết hợp chạy quảng cáo đa nền tảng và tự động hóa nội dung bằng AI.',
    path: '/services/digital-marketing-ai-content',
    locale,
  });
}

export default function DigitalMarketingPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Digital Marketing & AI Content đa nền tảng
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era cung cấp dịch vụ digital marketing toàn diện, kết hợp chạy quảng cáo đa nền tảng và tự động hóa nội dung bằng AI, giúp doanh nghiệp tiếp cận đúng khách hàng, tiết kiệm thời gian sản xuất nội dung và tối ưu hiệu quả chiến dịch.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quảng cáo đa nền tảng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Meta Ads (Facebook, Instagram, Threads)</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết lập và tối ưu chiến dịch quảng cáo trên hệ sinh thái Meta: định vị đối tượng, tối ưu Creative, A/B testing và tối ưu budget để đạt hiệu quả CPA/ROAS tốt nhất.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">TikTok Ads</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế và triển khai quảng cáo trên TikTok, phù hợp với định dạng ngắn, xu hướng nội dung và hành vi người dùng trẻ, giúp thương hiệu lan tỏa nhanh chóng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Google Ads & Google Maps</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quảng cáo tìm kiếm Google, Google Shopping và đưa doanh nghiệp lên Google Maps, giúp khách hàng tìm thấy bạn đúng thời điểm có nhu cầu mua hàng hoặc đến cửa hàng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tối ưu theo mục tiêu kinh doanh</h3>
              <p className="text-sm text-muted leading-relaxed">
                Mỗi kênh được phân bổ và tối ưu theo mục tiêu: nhận diện thương hiệu, thu thập lead, tăng doanh số hay duy trì tương tác cộng đồng.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">AI Content & Auto-content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">AI tạo nội dung tự động</h3>
              <p className="text-sm text-muted leading-relaxed">
                Sử dụng AI để tạo bài viết, mô tả sản phẩm, script video, caption mạng xã hội và nội dung email, đảm bảo nhất quán thương hiệu và tiết kiệm thời gian sản xuất.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Content Hub đăng bài đa nền tảng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Triển khai content hub tự động đăng bài lên nhiều nền tảng cùng lúc: website, fanpage, TikTok, Instagram, Threads, LinkedIn... giúp nội dung tiếp cận khách hàng ở mọi điểm chạm.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Lập kế hoạch nội dung</h3>
              <p className="text-sm text-muted leading-relaxed">
                Xây dựng lịch nội dung theo mục tiêu marketing, sự kiện và mùa vụ, kết hợp dữ liệu hiệu suất để liên tục cải thiện chất lượng nội dung.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Tại sao chọn AI Era cho Digital Marketing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tư duy data-driven</h3>
              <p className="text-sm text-muted leading-relaxed">
                Mọi quyết định chiến dịch dựa trên dữ liệu, không phải cảm tính.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Kết hợp đa kênh</h3>
              <p className="text-sm text-muted leading-relaxed">
                Đồng bộ thông điệp và hiệu suất giữa các nền tảng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tự động hóa có chiến lược</h3>
              <p className="text-sm text-muted leading-relaxed">
                AI hỗ trợ sản xuất và phân phối nội dung, con người kiểm soát chiến lược và chất lượng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Báo cáo minh bạch</h3>
              <p className="text-sm text-muted leading-relaxed">
                Theo dõi chi tiêu, hiệu quả và đề xuất điều chỉnh rõ ràng từng kênh.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn cần triển khai digital marketing và tự động hóa nội dung cho doanh nghiệp? Liên hệ AI Era để nhận đề xuất chiến lược phù hợp.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/landing-page-hosting" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Landing page & Hosting →
            </Link>
            <Link href="/services/thiet-ke-website-chuan-seo" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Thiết kế website chuẩn SEO →
            </Link>
            <Link href="/services/phan-mem-quan-ly-doanh-nghiep" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Phần mềm quản lý doanh nghiệp →
            </Link>
          </div>
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: 'Digital Marketing & AI Content đa nền tảng',
            description: 'Dịch vụ digital marketing toàn diện, kết hợp quảng cáo đa nền tảng và tự động hóa nội dung bằng AI.',
            url: `https://ai-era.vn/${locale}/services/digital-marketing-ai-content`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'Digital Marketing & AI Content', url: `https://ai-era.vn/${locale}/services/digital-marketing-ai-content` },
          ])),
        }}
      />
    </div>
  );
}
