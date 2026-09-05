import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'Thiết kế website chuẩn SEO & AI SEO — AI Era',
    description: 'Thiết kế website doanh nghiệp với kiến trúc semantic-first, tốc độ tải tối ưu và tối ưu AI discovery.',
    path: '/services/thiet-ke-website-chuan-seo',
    locale,
  });
}

export default function SeoWebDesignPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Thiết kế website chuẩn SEO & AI SEO
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era thiết kế website doanh nghiệp với kiến trúc semantic-first, tốc độ tải tối ưu và tối ưu AI discovery, giúp doanh nghiệp không chỉ được tìm thấy trên Google mà còn xuất hiện trong AI Overviews, ChatGPT, Perplexity và các công cụ tìm kiếm AI.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Thiết kế website chuẩn SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Kiến trúc thông tin rõ ràng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế cấu trúc website với heading hierarchy hợp lý, breadcrumb, internal linking và phân cấp nội dung logic, giúp công cụ tìm kiếm hiểu và đánh giá đúng vai trò của từng trang.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tối ưu kỹ thuật (Technical SEO)</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tối ưu tốc độ tải, Core Web Vitals, schema markup, hreflang (nếu cần), canonical, XML sitemap và robots.txt theo chuẩn Google. Website được kiểm tra trước khi bàn giao.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Trải nghiệm người dùng (UX) & tương thích di động</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế responsive, điều hướng trực quan, form tối ưu chuyển đổi, đảm bảo trải nghiệm nhất quán trên desktop và mobile.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Bảo mật & vận hành</h3>
              <p className="text-sm text-muted leading-relaxed">
                Cấu hình HTTPS, header bảo mật, sao lưu định kỳ và kế hoạch bảo trì để website hoạt động ổn định lâu dài.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">AI SEO & AI discovery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Tối ưu cho AI Overviews & AI Mode</h3>
              <p className="text-sm text-muted leading-relaxed">
                Tối ưu nội dung theo mô hình AI-first: trả lời trực tiếp câu hỏi người dùng, cấu trúc hóa dữ liệu, làm rõ entity và mối liên hệ giữa các khái niệm, giúp AI công cụ dễ dàng trích dẫn nguồn.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Schema markup & structured data</h3>
              <p className="text-sm text-muted leading-relaxed">
                Triển khai schema phù hợp (Organization, Service, FAQ, Article, Product...) giúp công cụ tìm kiếm hiểu chính xác nội dung và tăng khả năng hiển thị đa dạng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Entity & topical authority</h3>
              <p className="text-sm text-muted leading-relaxed">
                Xây dựng cụm nội dung chuyên sâu (content cluster) xung quanh chủ đề cốt lõi, giúp website được AI công cụ nhận diện là nguồn chuyên gia đáng tin cậy.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quy trình thiết kế website tại AI Era</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">1. Nghiên cứu & chiến lược</h3>
              <p className="text-sm text-muted leading-relaxed">
                Phân tích đối thủ, từ khóa mục tiêu và hành trình khách hàng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">2. Thiết kế & xây dựng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Thiết kế UI/UX và phát triển website chuẩn SEO cơ bản.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">3. Tối ưu nội dung & AI SEO</h3>
              <p className="text-sm text-muted leading-relaxed">
                Viết nội dung theo E-E-A-T, tối ưu cấu trúc và schema.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">4. Kiểm tra & bàn giao</h3>
              <p className="text-sm text-muted leading-relaxed">
                Kiểm tra kỹ thuật, tốc độ, SEO và AI discovery trước khi bàn giao.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">5. Bảo trì & cải tiến</h3>
              <p className="text-sm text-muted leading-relaxed">
                Theo dõi hiệu suất, cập nhật nội dung và tối ưu liên tục.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'vi' ? 'Dự án tiêu biểu' : 'Featured Projects'}
          </h2>
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
              {locale === 'vi' ? (
                <>
                  AI Era thiết kế và triển khai website chuẩn SEO cho{' '}
                  <a
                    href="https://arabeautycenter.com/"
                    target="_blank"
                    rel="noopener"
                    className="text-indigo hover:text-indigo-2 transition-colors"
                  >
                    ARA Beauty Center
                  </a>
                  , tối ưu kiến trúc thông tin, tốc độ tải và cấu trúc heading/schema chuẩn SEO cho ngành làm đẹp — spa & thẩm mỹ.
                </>
              ) : (
                <>
                  AI Era designed and deployed an SEO-standard website for{' '}
                  <a
                    href="https://arabeautycenter.com/"
                    target="_blank"
                    rel="noopener"
                    className="text-indigo hover:text-indigo-2 transition-colors"
                  >
                    ARA Beauty Center
                  </a>
                  , optimizing information architecture, load speed, and SEO-compliant heading/schema structures tailored for the beauty, spa & aesthetics industry.
                </>
              )}
            </p>
          </GlassCard>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn cần thiết kế website doanh nghiệp chuẩn SEO và AI SEO? Liên hệ AI Era để nhận báo giá và lộ trình phù hợp.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/phan-tich-dinh-luong-chung-khoan" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Phân tích định lượng chứng khoán →
            </Link>
            <Link href="/services/ai-automation-ai-agent" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              AI Automation & AI Agent →
            </Link>
            <Link href="/services/landing-page-hosting" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Landing page & Hosting →
            </Link>
          </div>
        </div>

        <CTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: 'Thiết kế website chuẩn SEO & AI SEO',
            description: 'Thiết kế website doanh nghiệp với kiến trúc semantic-first, tốc độ tối ưu và AI discovery.',
            url: `https://ai-era.vn/${locale}/services/thiet-ke-website-chuan-seo`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'Thiết kế website chuẩn SEO', url: `https://ai-era.vn/${locale}/services/thiet-ke-website-chuan-seo` },
          ])),
        }}
      />
    </div>
  );
}
