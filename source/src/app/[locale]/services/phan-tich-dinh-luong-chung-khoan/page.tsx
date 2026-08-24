import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'Phân tích định lượng chứng khoán Việt Nam — AI Era',
    description: 'Dịch vụ phân tích định lượng và đưa tín hiệu trên thị trường chứng khoán Việt Nam, kết hợp dữ liệu lịch sử, mô hình factor-based, machine learning và quản lý rủi ro.',
    path: '/services/phan-tich-dinh-luong-chung-khoan',
    locale,
  });
}

export default function QuantEquityPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Phân tích định lượng chứng khoán Việt Nam
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era cung cấp dịch vụ phân tích định lượng và đưa tín hiệu trên thị trường chứng khoán Việt Nam, kết hợp dữ liệu lịch sử, mô hình factor-based, machine learning và quản lý rủi ro để hỗ trợ nhà đầu tư ra quyết định có cơ sở khoa học.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-3">Tín hiệu định lượng hàng ngày</h3>
            <p className="text-sm text-muted leading-relaxed">
              Hệ thống thu thập và xử lý dữ liệu thị trường, đưa ra tín hiệu mua/bán dựa trên mô hình định lượng được kiểm chửa trên văn bản lịch sử thị trường Việt Nam.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-3">Phân tích factor model & screening cổ phiếu</h3>
            <p className="text-sm text-muted leading-relaxed">
              Sử dụng mô hình factor-based để phân loại cổ phiếu theo tiêu chí giá trị, tăng trưởng, chất lượng và động lượng.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-3">Machine learning & dự báo xu hướng</h3>
            <p className="text-sm text-muted leading-relaxed">
              Áp dụng thuật toán machine learning để nhận diện mẫu hình và dự báo xu hướng ngắn và trung hạn.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-3">Báo cáo định kỳ & quản lý rủi ro</h3>
            <p className="text-sm text-muted leading-relaxed">
              Cung cấp báo cáo định kỳ về danh mục, hiệu suất và biến động thị trường, kèm khuyến nghị điều chỉnh theo mức độ chấp nhận rủi ro.
            </p>
          </GlassCard>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Đối tượng sử dụng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Nhà đầu tư cá nhân</h3>
              <p className="text-sm text-muted leading-relaxed">
                Muốn nâng cao hiệu suất danh mục với tín hiệu định lượng và phân tích chuyên sâu thị trường Việt Nam.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Quỹ đầu tư & tổ chức tài chính</h3>
              <p className="text-sm text-muted leading-relaxed">
                Cần tín hiệu định lượng bổ sung để đa dạng hóa chiến lược đầu tư và quản lý rủi ro.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Chuyên gia phân tích</h3>
              <p className="text-sm text-muted leading-relaxed">
                Muốn đa dạng hóa công cụ nghiên cứu và có thêm dữ liệu machine learning cho phân tích.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Doanh nhân có nguồn vốn dư</h3>
              <p className="text-sm text-muted leading-relaxed">
                Muốn đầu tư có chiến lược, dựa trên dữ liệu và phân tích chuyên môn thay vì cảm tính.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Lý do chọn AI Era</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Chuyên sâu thị trường Việt Nam</h3>
              <p className="text-sm text-muted leading-relaxed">
                Mô hình được xây dựng và hiệu chỉnh dựa trên đặc thù thị trường chứng khoán nội địa.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Minh bạch rõ ràng</h3>
              <p className="text-sm text-muted leading-relaxed">
                Mỗi tín hiệu đều có cơ sở dữ liệu và lý giải minh bạch, giúp nhà đầu tư tự đánh giá và ra quyết định độc lập.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Kết hợp AI và con người</h3>
              <p className="text-sm text-muted leading-relaxed">
                Công nghệ hỗ trợ, quyết định cuối cùng thuộc về nhà đầu tư.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">Cập nhật liên tục</h3>
              <p className="text-sm text-muted leading-relaxed">
                Hệ thống theo dõi và tinh chỉnh mô hình theo biến động thị trường.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn muốn biết thêm về dịch vụ phân tích định lượng và tín hiệu chứng khoán Việt Nam? Liên hệ với AI Era để nhận tư vấn chi tiết.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/ai-automation-ai-agent" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              AI Automation & AI Agent →
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
            name: 'Phân tích định lượng chứng khoán Việt Nam',
            description: 'Dịch vụ phân tích định lượng và đưa tín hiệu trên thị trường chứng khoán Việt Nam.',
            url: `https://ai-era.vn/${locale}/services/phan-tich-dinh-luong-chung-khoan`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'Phân tích định lượng chứng khoán', url: `https://ai-era.vn/${locale}/services/phan-tich-dinh-luong-chung-khoan` },
          ])),
        }}
      />
    </div>
  );
}
