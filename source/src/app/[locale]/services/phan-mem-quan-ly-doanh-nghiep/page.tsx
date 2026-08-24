import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';
import { softwareApplicationSchema, breadcrumbSchema } from '@/lib/seo/schema';
import GlassCard from '@/components/ui/GlassCard';
import CTA from '@/components/sections/CTA';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'Phần mềm quản lý doanh nghiệp ngành — AI Era',
    description: 'Giải pháp phần mềm quản lý nghiệp vụ lõi cho Spa, Nail, Thẩm mỹ viện, Nha khoa, Phòng khám Đa khoa và Gym.',
    path: '/services/phan-mem-quan-ly-doanh-nghiep',
    locale,
  });
}

export default function EnterpriseSoftwarePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Phần mềm quản lý doanh nghiệp ngành
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-12">
          AI Era cung cấp hệ sinh thái phần mềm quản lý doanh nghiệp chuyên biệt cho từng ngành: Spa, Nail, Thẩm mỹ viện, Nha khoa, Phòng khám Đa khoa và Gym. Mỗi sản phẩm được thiết kế để tự động hóa quy trình vận hành, quản lý khách hàng, nhân viên, dịch vụ và tài chính một cách hiệu quả.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Giải pháp theo ngành</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iSpa — Quản lý Spa</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý lịch hẹn, dịch vụ, nhân viên và phòng. Theo dõi liệu trình chăm sóc và lịch sử khách hàng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iNail — Quản lý Nail</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý lịch hẹn, kỹ thuật viên và dịch vụ nail. Theo dõi lịch sử làm móng và sở thích khách hàng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iBeauty — Quản lý Thẩm mỹ viện</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý liệu trình điều trị, bác sĩ/kỹ thuật viên và phòng điều trị. Theo dõi tình trạng da và kết quả khách hàng.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iDental — Quản lý Nha khoa</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý lịch hẹn, nha sĩ, phòng điều trị và dịch vụ. Hồ sơ bệnh án điện tử và phác đồ điều trị.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iClinic — Quản lý Phòng khám Đa khoa</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý lịch hẹn, bác sĩ, chuyên khoa và phòng khám. Hồ sơ bệnh án, đơn thuốc và theo dõi sức khỏe.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-3">iGym — Quản lý Gym</h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý gói tập, hội viên, huấn luyện viên và lịch tập. Theo dõi tiến độ tập luyện và mục tiêu cá nhân.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Liên hệ tư vấn</h2>
          <p className="text-muted leading-relaxed mb-6">
            Bạn muốn ứng dụng phần mềm quản lý chuyên ngành cho doanh nghiệp? Liên hệ AI Era để nhận tư vấn và demo sản phẩm phù hợp.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/phan-tich-dinh-luong-chung-khoan" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              Phân tích định lượng chứng khoán →
            </Link>
            <Link href="/services/ai-automation-ai-agent" className="text-indigo hover:text-indigo-2 transition-colors text-sm">
              AI Automation & AI Agent →
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
          __html: JSON.stringify(softwareApplicationSchema({
            name: 'Phần mềm quản lý doanh nghiệp ngành',
            description: 'Giải pháp phần mềm quản lý nghiệp vụ lõi cho Spa, Nail, Thẩm mỹ viện, Nha khoa, Phòng khám Đa khoa và Gym.',
            url: `https://ai-era.vn/${locale}/services/phan-mem-quan-ly-doanh-nghiep`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: `https://ai-era.vn/${locale}` },
            { name: 'Services', url: `https://ai-era.vn/${locale}/services` },
            { name: 'Phần mềm quản lý doanh nghiệp', url: `https://ai-era.vn/${locale}/services/phan-mem-quan-ly-doanh-nghiep` },
          ])),
        }}
      />
    </div>
  );
}
