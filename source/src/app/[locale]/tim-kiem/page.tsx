import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isVi = locale === 'vi';
  return {
    ...buildMetadata({
      title: isVi ? 'Tìm kiếm giải pháp — AI Era' : 'Search Solutions — AI Era',
      description: isVi ? 'Tìm kiếm các giải pháp AI, dịch vụ và tài nguyên tại AI Era.' : 'Search AI Era solutions, services, and technology offerings.',
      path: '/tim-kiem',
      locale,
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

const allItems = [
  { title: 'Phân tích định lượng chứng khoán', href: '/services/phan-tich-dinh-luong-chung-khoan', desc: 'Factor model, Machine Learning, tín hiệu chứng khoán, Fintech.' },
  { title: 'AI Automation & AI Agent', href: '/services/ai-automation-ai-agent', desc: 'Tự động hóa quy trình nghiệp vụ, AI Agent 24/7, Workflow orchestration.' },
  { title: 'Thiết kế website chuẩn SEO & AI SEO', href: '/services/thiet-ke-website-chuan-seo', desc: 'Kiến trúc semantic, tốc độ cao, AI Discovery, ChatGPT/Perplexity citation.' },
  { title: 'Landing Page & Cloud Hosting', href: '/services/landing-page-hosting', desc: 'Landing page tối ưu chuyển đổi CRO, hạ tầng Cloud Hosting tốc độ cao.' },
  { title: 'Digital Marketing & AI Content', href: '/services/digital-marketing-ai-content', desc: 'Quảng cáo đa nền tảng Meta, Google, TikTok và AI Content Hub tự động.' },
  { title: 'Phần mềm quản lý doanh nghiệp', href: '/services/phan-mem-quan-ly-doanh-nghiep', desc: 'SaaS chuyên ngành Spa, Thẩm mỹ viện, Nha khoa, Phòng khám, Gym.' },
  { title: 'Về chúng tôi — AI Era Solution', href: '/about', desc: 'Giới thiệu về năng lực cốt lõi, đội ngũ và tầm nhìn hệ sinh thái AI Era.' },
  { title: 'Liên hệ tư vấn công nghệ', href: '/contact', desc: 'Thông tin hotline, Zalo và kênh hỗ trợ trực tiếp 24/7 của AI Era.' },
];

export default function SearchPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { q?: string };
}) {
  const isVi = locale === 'vi';
  const query = (searchParams?.q || '').toLowerCase().trim();

  const results = query
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
      )
    : allItems;

  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { name: isVi ? 'Trang chủ' : 'Home', url: `/${locale}` },
            { name: isVi ? 'Tìm kiếm' : 'Search', url: `/${locale}/tim-kiem` },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
          {isVi ? 'Tìm kiếm thông tin & giải pháp' : 'Search AI Era Solutions'}
        </h1>

        <form action={`/${locale}/tim-kiem`} method="get" className="mb-10">
          <div className="flex gap-3">
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder={isVi ? 'Nhập từ khóa cần tìm (vd: fintech, automation, seo...)' : 'Enter search keyword...'}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-2 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-2 text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {isVi ? 'Tìm kiếm' : 'Search'}
            </button>
          </div>
        </form>

        {query && (
          <p className="text-sm text-muted mb-6 font-mono">
            {isVi ? `Kết quả cho từ khóa "${query}": (${results.length})` : `Results for "${query}": (${results.length})`}
          </p>
        )}

        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="block p-5 rounded-2xl border border-border/70 hover:border-indigo/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <h2 className="text-base font-bold text-foreground mb-1 hover:text-indigo-2 transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </Link>
            ))
          ) : (
            <p className="text-muted text-sm italic">
              {isVi ? 'Không tìm thấy kết quả phù hợp. Hãy thử từ khóa khác.' : 'No matching results found.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
