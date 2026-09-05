import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import Breadcrumb from '@/components/ui/Breadcrumb';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isVi = locale === 'vi';
  return {
    ...buildMetadata({
      title: isVi ? 'Chính sách bảo mật — AI Era' : 'Privacy Policy — AI Era',
      description: isVi ? 'Chính sách bảo mật thông tin và an toàn dữ liệu khách hàng tại AI Era.' : 'Privacy and data protection policy of AI Era.',
      path: '/privacy',
      locale,
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  const isVi = locale === 'vi';
  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: `/${locale}` },
    { name: isVi ? 'Chính sách bảo mật' : 'Privacy Policy', url: `/${locale}/privacy` },
  ];

  return (
    <div className="relative z-10 pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          {isVi ? 'Chính sách bảo mật thông tin' : 'Privacy Policy'}
        </h1>
        <div className="space-y-6 text-sm text-muted leading-relaxed">
          <p>
            {isVi
              ? 'Tại AI Era, chúng tôi coi trọng sự riêng tư và bảo mật dữ liệu của quý khách hàng và đối tác doanh nghiệp.'
              : 'At AI Era, we prioritize the confidentiality and security of our clients and enterprise partners.'}
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">{isVi ? '1. Thu thập dữ liệu' : '1. Data Collection'}</h2>
          <p>
            {isVi
              ? 'Chúng tôi chỉ thu thập các thông tin liên hệ được quý khách tự nguyện cung cấp (Họ tên, Số điện thoại, Email, Yêu cầu nghiệp vụ) nhằm mục đích tư vấn dịch vụ.'
              : 'We only collect contact information voluntarily provided for consultation purposes.'}
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-6">{isVi ? '2. Cam kết bảo mật' : '2. Data Confidentiality'}</h2>
          <p>
            {isVi
              ? 'Dữ liệu và mã nguồn của khách hàng khi triển khai giải pháp AI hoặc phần mềm luôn được phân tách độc lập và mã hoá, không chia sẻ cho bất kỳ bên thứ ba nào.'
              : 'All enterprise client data and source codes are stored in isolated, encrypted environments with strict zero-leakage standards.'}
          </p>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: isVi ? 'Trang chủ' : 'Home', url: `${siteConfig.url}/${locale}` },
            { name: isVi ? 'Chính sách bảo mật' : 'Privacy Policy', url: `${siteConfig.url}/${locale}/privacy` },
          ])),
        }}
      />
    </div>
  );
}
