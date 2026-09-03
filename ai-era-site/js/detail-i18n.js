// js/detail-i18n.js — i18n support for detail HTML pages
import { getCurrentLang, setLanguage } from './i18n.js';

export const detailTranslations = {
  vi: {
    'back-link': 'Quay lại AI Era Ecosystem',
    // 1. ai-automation-ai-agent
    'auto-meta-desc': 'AI Era — AI Automation & AI Agent: tự động hoá quy trình nghiệp vụ, triển khai AI Agent xử lý khách hàng và tác vụ đa bước.',
    'auto-meta-title': 'AI Automation & AI Agent — AI Era',
    'auto-h1': 'AI Automation & AI Agent — Tự động hóa thông minh, Tối ưu quy trình doanh nghiệp',
    'auto-p1': 'AI Era cung cấp giải pháp AI Automation và triển khai AI Agent theo yêu cầu, giúp doanh nghiệp tự động hóa quy trình lặp lại, nâng cao hiệu suất nhân sự và mở rộng quy mô vận hành mà không cần gia tăng chi phí nhân lực tương ứng.',
    'auto-h2-1': 'AI Automation',
    'auto-h3-1': 'Tự động hóa quy trình nghiệp vụ (Workflow Automation)',
    'auto-p2': 'Thiết kế và tích hợp các luồng công việc tự động giữa các công cụ, hệ thống và nền tảng doanh nghiệp đang sử dụng, từ xử lý đơn hàng, chăm sóc khách hàng đến báo cáo tự động.',
    'auto-h3-2': 'Tích hợp hệ thống (Integration)',
    'auto-p3': 'Kết nối dữ liệu và tương tác giữa các phần mềm quản lý, CRM, ERP, nền tảng bán hàng và kênh marketing để loại bỏ nhập liệu thủ công và giảm sai sót.',
    'auto-h3-3': 'Tự động hóa có giám sát (Human-in-the-loop)',
    'auto-p4': 'Thiết lập quy trình tự động có điểm kiểm soát của con người, đảm bảo chất lượng đầu ra và tuân thủ quy định doanh nghiệp.',
    'auto-h2-2': 'AI Agent',
    'auto-h3-4': 'Agent hỗ trợ khách hàng',
    'auto-p5': 'Triển khai agent thông minh xử lý tư vấn, giải đáp thắc mắc và hỗ trợ khách hàng 24/7 trên website, Messenger, Zalo và các kênh khác.',
    'auto-h3-5': 'Agent xử lý nghiệp vụ phức tạp',
    'auto-p6': 'Phát triển agent có khả năng lập kế hoạch, dùng công cụ, cập nhật trạng thái và thực thi chuỗi thao tác nhiều bước: từ tạo báo cáo, phân tích dữ liệu đến tự động hóa quy trình nội bộ.',
    'auto-h3-6': 'Agent đa kênh (Omnichannel)',
    'auto-p7': 'Triển khai agent hoạt động nhất quán trên nhiều kênh tiếp xúc, duy trì ngữ cảnh và trải nghiệm liền mạch cho người dùng.',
    'auto-h2-3': 'Lợi ích khi triển khai AI Automation & AI Agent cùng AI Era',
    'auto-li-1': '<strong>Tăng tốc vận hành:</strong> Giảm thời gian xử lý thủ công, nâng cao throughput của đội ngũ.',
    'auto-li-2': '<strong>Giảm chi phí:</strong> Tự động hóa quy trình lặp lại giúp tái phân bổ nguồn lực sang công việc chiến lược.',
    'auto-li-3': '<strong>Mở rộng linh hoạt:</strong> Hệ thống tự động và agent có thể xử lý khối lượng công việc lớn mà không cần tuyển thêm nhân sự.',
    'auto-li-4': '<strong>Dữ liệu tập trung:</strong> Tất cả thao tác đều có log, dễ theo dõi, đối chiếu và tối ưu liên tục.',
    'auto-h2-4': 'Liên hệ tư vấn',
    'auto-p8': 'Bạn đang tìm giải pháp tự động hóa quy trình hoặc triển khai AI Agent cho doanh nghiệp? Liên hệ với AI Era để được đánh giá nhu cầu và đề xuất giải pháp phù hợp.',
    'auto-quote': 'AI Era — Intelligence in motion. Biến quy trình thủ công thành hệ thống tự học, tự chạy.',

    // 2. digital-marketing-ai-content
    'mkt-meta-desc': 'AI Era — Digital Marketing & AI Content đa nền tảng: quảng cáo Meta, TikTok, Google Maps, tự động hoá nội dung bằng AI.',
    'mkt-meta-title': 'Digital Marketing & AI Content — AI Era',
    'mkt-h1': 'Digital Marketing & AI Content đa nền tảng — Tăng trưởng toàn diện với AI và Dữ liệu',
    'mkt-p1': 'AI Era cung cấp dịch vụ digital marketing toàn diện, kết hợp chạy quảng cáo đa nền tảng và tự động hóa nội dung bằng AI, giúp doanh nghiệp tiếp cận đúng khách hàng, tiết kiệm thời gian sản xuất nội dung và tối ưu hiệu quả chiến dịch.',
    'mkt-h2-1': 'Quảng cáo đa nền tảng',
    'mkt-h3-1': 'Meta Ads (Facebook, Instagram, Threads)',
    'mkt-p2': 'Thiết lập và tối ưu chiến dịch quảng cáo trên hệ sinh thái Meta: định vị đối tượng, tối ưu Creative, A/B testing và tối ưu budget để đạt hiệu quả CPA/ROAS tốt nhất.',
    'mkt-h3-2': 'TikTok Ads',
    'mkt-p3': 'Thiết kế và triển khai quảng cáo trên TikTok, phù hợp với định dạng ngắn, xu hướng nội dung và hành vi người dùng trẻ, giúp thương hiệu lan tỏa nhanh chóng.',
    'mkt-h3-3': 'Google Ads & Google Maps',
    'mkt-p4': 'Quảng cáo tìm kiếm Google, Google Shopping và đưa doanh nghiệp lên Google Maps, giúp khách hàng tìm thấy bạn đúng thời điểm có nhu cầu mua hàng hoặc đến cửa hàng.',
    'mkt-h3-4': 'Tối ưu theo mục tiêu kinh doanh',
    'mkt-p5': 'Mỗi kênh được phân bổ và tối ưu theo mục tiêu: nhận diện thương hiệu, thu thập lead, tăng doanh số hay duy trì tương tác cộng đồng.',
    'mkt-h2-2': 'AI Content & Auto-content',
    'mkt-h3-5': 'AI tạo nội dung tự động',
    'mkt-p6': 'Sử dụng AI để tạo bài viết, mô tả sản phẩm, script video, caption mạng xã hội và nội dung email, đảm bảo nhất quán thương hiệu và tiết kiệm thời gian sản xuất.',
    'mkt-h3-6': 'Content Hub đăng bài đa nền tảng',
    'mkt-p7': 'Triển khai content hub tự động đăng bài lên nhiều nền tảng cùng lúc: website, fanpage, TikTok, Instagram, Threads, LinkedIn... giúp nội dung tiếp cận khách hàng ở mọi điểm chạm.',
    'mkt-h3-7': 'Lập kế hoạch nội dung (Content Planning)',
    'mkt-p8': 'Xây dựng lịch nội dung theo mục tiêu marketing, sự kiện và mùa vụ, kết hợp dữ liệu hiệu suất để liên tục cải thiện chất lượng nội dung.',
    'mkt-h2-3': 'Tại sao chọn AI Era cho Digital Marketing?',
    'mkt-li-1': '<strong>Tư duy data-driven:</strong> Mọi quyết định chiến dịch dựa trên dữ liệu, không phải cảm tính.',
    'mkt-li-2': '<strong>Kết hợp đa kênh:</strong> Đồng bộ thông điệp và hiệu suất giữa các nền tảng.',
    'mkt-li-3': '<strong>Tự động hóa có chiến lược:</strong> AI hỗ trợ sản xuất và phân phối nội dung, con người kiểm soát chiến lược và chất lượng.',
    'mkt-li-4': '<strong>Báo cáo minh bạch:</strong> Theo dõi chi tiêu, hiệu quả và đề xuất điều chỉnh rõ ràng từng kênh.',
    'mkt-h2-4': 'Liên hệ tư vấn',
    'mkt-p9': 'Bạn cần triển khai digital marketing và tự động hóa nội dung cho doanh nghiệp? Liên hệ AI Era để nhận đề xuất chiến lược phù hợp.',
    'mkt-quote': 'AI Era — Intelligence in motion. Đưa thương hiệu đến đúng khách hàng, đúng thời điểm, đúng kênh.',

    // 3. landing-page-hosting
    'land-meta-desc': 'AI Era — Thiết kế Landing Page chuyển đổi cao kèm miễn phí Hosting, triển khai chiến dịch nhanh chóng.',
    'land-meta-title': 'Landing Page & Hosting — AI Era',
    'land-h1': 'Thiết kế Landing Page đẹp & Miễn phí Hosting — Chuyển đổi tối đa, Chi phí tối ưu',
    'land-p1': 'AI Era thiết kế landing page chuyên dụng cho chiến dịch quảng cáo, ra mắt sản phẩm, thu thập lead hoặc khuyến mãi, kết hợp gói hosting miễn phí giúp doanh nghiệp triển khai nhanh chóng mà không phải lo về hạ tầng.',
    'land-h2-1': 'Thiết kế Landing Page',
    'land-h3-1': 'Thiết kế theo mục tiêu chuyển đổi',
    'land-p2': 'Mỗi landing page được thiết kế xoay quanh một mục tiêu duy nhất: đăng ký, tải xuống, liên hệ hay mua hàng. Layout, màu sắc, hình ảnh và CTA được tối ưu để hướng người dùng đến hành động mục tiêu.',
    'land-h3-2': 'Tối ưu tốc độ & trải nghiệm',
    'land-p3': 'Tối ưu hình ảnh, code và cấu trúc trang để landing page tải nhanh, giảm tỷ lệ thoát và tăng chất lượng điểm Quality Score trên Google Ads, Meta Ads.',
    'land-h3-3': 'Tương thích đa thiết bị',
    'land-p4': 'Thiết kế responsive đảm bảo trải nghiệm tốt trên điện thoại, máy tính bảng và desktop — nơi người dùng thường xuyên tiếp cận quảng cáo.',
    'land-h3-4': 'A/B testing & cải tiến',
    'land-p5': 'Hỗ trợ thiết kế phiên bản thử nghiệm (A/B) để so sánh tiêu đề, hình ảnh, CTA và tối ưu dựa trên dữ liệu thực tế.',
    'land-h2-2': 'Miễn phí Hosting',
    'land-h3-5': 'Hạ tầng ổn định',
    'land-p6': 'Cung cấp hosting ổn định với uptime cao, hỗ trợ HTTPS, sao lưu tự động và bảo mật cơ bản, giúp landing page hoạt động liên tục trong suốt chiến dịch.',
    'land-h3-6': 'Tích hợp nhanh',
    'land-p7': 'Hỗ trợ triển khai landing page lên hosting chỉ trong thời gian ngắn, tích hợp sẵn với tên miền, SSL và công cụ theo dõi khi cần.',
    'land-h3-7': 'Không phụ thuộc nền tảng',
    'land-p8': 'Bạn sở hữu toàn bộ landing page và dữ liệu, không bị khóa trong nền tảng bên thứ ba, dễ dàng chuyển đổi hoặc nâng cấp khi cần.',
    'land-h2-3': 'Khi nào nên dùng Landing Page riêng?',
    'land-li-1': 'Triển khai chiến dịch Meta, Google Ads, TikTok Ads',
    'land-li-2': 'Ra mắt sản phẩm hoặc dịch vụ mới',
    'land-li-3': 'Thu thập lead từ chương trình khuyến mãi, sự kiện',
    'land-li-4': 'Hướng đến một đối tượng khách hàng cụ thể (targeted audience)',
    'land-h2-4': 'Liên hệ tư vấn',
    'land-p9': 'Bạn cần thiết kế landing page chuyên nghiệp và tìm hosting phù hợp? Liên hệ AI Era để nhận đề xuất thiết kế và triển khai nhanh chóng.',
    'land-quote': 'AI Era — Intelligence in motion. Một trang, một mục tiêu, một chiến dịch thành công.',

    // 4. phan-mem-quan-ly-doanh-nghiep
    'pm-meta-desc': 'AI Era — Phần mềm quản lý doanh nghiệp ngành: Spa, Nail, Thẩm mỹ viện, Nha khoa, Phòng khám, Gym.',
    'pm-meta-title': 'Phần mềm quản lý doanh nghiệp ngành — AI Era',
    'pm-h1': 'Phần mềm quản lý doanh nghiệp — Giải pháp nghiệp vụ lõi cho từng ngành',
    'pm-p1': 'AI Era cung cấp hệ sinh thái phần mềm quản lý doanh nghiệp chuyên biệt cho từng ngành: Spa, Nail, Thẩm mỹ viện, Nha khoa, Phòng khám Đa khoa và Gym. Mỗi sản phẩm được thiết kế để tự động hóa quy trình vận hành, quản lý khách hàng, nhân viên, dịch vụ và tài chính một cách hiệu quả.',
    'pm-h2-1': 'iSpa — Quản lý Spa',
    'pm-ispa-1': 'Quản lý lịch hẹn, dịch vụ, nhân viên và phòng',
    'pm-ispa-2': 'Theo dõi liệu trình chăm sóc và lịch sử khách hàng',
    'pm-ispa-3': 'Quản lý kho nguyên liệu, nhập/xuất và hóa đơn',
    'pm-ispa-4': 'Báo cáo doanh thu, hiệu suất nhân viên và tỷ lệ quay lại',
    'pm-ispa-5': 'Tích hợp đặt lịch online, SMS/Zalo nhắc lịch',
    'pm-h2-2': 'iNail — Quản lý Nail',
    'pm-inail-1': 'Quản lý lịch hẹn, kỹ thuật viên và dịch vụ nail',
    'pm-inail-2': 'Theo dõi lịch sử làm móng, sở thích và ghi chú khách hàng',
    'pm-inail-3': 'Quản lý tồn kho sơn móng, phụ kiện và dụng cụ',
    'pm-inail-4': 'Báo cáo doanh thu theo kỹ thuật viên, theo ngày và theo dịch vụ',
    'pm-inail-5': 'Hỗ trợ đặt lịch qua fanpage, website hoặc Zalo',
    'pm-h2-3': 'iBeauty — Quản lý Thẩm mỹ viện',
    'pm-ibeauty-1': 'Quản lý liệu trình điều trị, bác sĩ/kỹ thuật viên và phòng điều trị',
    'pm-ibeauty-2': 'Theo dõi tình trạng da, phác đồ điều trị và kết quả khách hàng',
    'pm-ibeauty-3': 'Quản lý kho mỹ phẩm, dụng cụ và hóa đơn bán hàng',
    'pm-ibeauty-4': 'Báo cáo doanh thu, tỷ lệ chuyển đổi dịch vụ và hiệu quả điều trị',
    'pm-ibeauty-5': 'Tích hợp đặt lịch tư vấn và chăm sóc sau liệu trình',
    'pm-h2-4': 'iDental — Quản lý Nha khoa',
    'pm-idental-1': 'Quản lý lịch hẹn, nha sĩ, phòng điều trị và dịch vụ',
    'pm-idental-2': 'Hồ sơ bệnh án điện tử, phác đồ điều trị và hình ảnh X-quang',
    'pm-idental-3': 'Quản lý kho vật tư y tế, nhập/xuất và hạn sử dụng',
    'pm-idental-4': 'Báo cáo doanh thu, hiệu suất nha sĩ và tỷ lệ tái khám',
    'pm-idental-5': 'Tích hợp SMS/Zalo nhắc lịch và chăm sóc sau điều trị',
    'pm-h2-5': 'iClinic — Quản lý Phòng khám Đa khoa',
    'pm-iclinic-1': 'Quản lý lịch hẹn, bác sĩ, chuyên khoa và phòng khám',
    'pm-iclinic-2': 'Hồ sơ bệnh án, đơn thuốc, chỉ định xét nghiệm và theo dõi sức khỏe',
    'pm-iclinic-3': 'Quản lý kho thuốc, vật tư y tế và hóa đơn bảo hiểm',
    'pm-iclinic-4': 'Báo cáo doanh thu, tần suất khám và hiệu suất bác sĩ',
    'pm-iclinic-5': 'Tích hợp đặt lịch online, nhắc lịch tự động và chăm sóc bệnh nhân',
    'pm-h2-6': 'iGym — Quản lý Gym',
    'pm-igym-1': 'Quản lý gói tập, hội viên, huấn luyện viên và lịch tập',
    'pm-igym-2': 'Theo dõi tiến độ tập luyện, chỉ số sức khỏe và mục tiêu cá nhân',
    'pm-igym-3': 'Quản lý thu phí, gia hạn gói tập và khuyến mãi',
    'pm-igym-4': 'Báo cáo doanh thu, tỷ lệ giữ chân hội viên và hiệu suất HLV',
    'pm-igym-5': 'Tích hợp đăng ký gói online, check-in QR và thông báo tự động',
    'pm-h2-7': 'Lý do chọn giải pháp phần mềm ngành của AI Era',
    'pm-li-1': '<strong>Chuyên biệt từng ngành:</strong> Mỗi sản phẩm được xây dựng theo đặc thù nghiệp vụ thực tế, không phải giải pháp đa năng chung chung.',
    'pm-li-2': '<strong>Tự động hóa quy trình:</strong> Giảm thủ công, giảm sai sót và tăng tốc vận hành hàng ngày.',
    'pm-li-3': '<strong>Báo cáo thông minh:</strong> Theo dõi doanh thu, hiệu suất nhân viên và hành vi khách hàng để ra quyết định chính xác.',
    'pm-li-4': '<strong>Triển khai nhanh:</strong> Đội ngũ AI Era hỗ trợ cấu hình, đào tạo và vận hành, giảm thời gian áp dụng.',
    'pm-h2-8': 'Liên hệ tư vấn',
    'pm-p2': 'Bạn muốn ứng dụng phần mềm quản lý chuyên ngành cho doanh nghiệp? Liên hệ AI Era để nhận tư vấn và demo sản phẩm phù hợp.',
    'pm-quote': 'AI Era — Intelligence in motion. Phần mềm không chỉ quản lý, mà còn giúp doanh nghiệp tăng trưởng.',

    // 5. phan-tich-dinh-luong-chung-khoan
    'quant-meta-desc': 'AI Era — Phân tích định lượng chứng khoán Việt Nam: mô hình factor-based, machine learning, tín hiệu mua/bán và quản lý rủi ro.',
    'quant-meta-title': 'Phân tích định lượng chứng khoán — AI Era',
    'quant-h1': 'Phân tích định lượng chứng khoán Việt Nam — Tín hiệu dữ liệu, Quyết định chính xác',
    'quant-p1': 'AI Era cung cấp dịch vụ phân tích định lượng và đưa tín hiệu trên thị trường chứng khoán Việt Nam, kết hợp dữ liệu lịch sử, mô hình factor-based, machine learning và quản lý rủi ro để hỗ trợ nhà đầu tư ra quyết định có cơ sở khoa học.',
    'quant-h2-1': 'Dịch vụ chính',
    'quant-h3-1': 'Tín hiệu định lượng hàng ngày',
    'quant-p2': 'Hệ thống thu thập và xử lý dữ liệu thị trường, đưa ra tín hiệu mua/bán dựa trên mô hình định lượng được kiểm chứng trên dữ liệu lịch sử thị trường Việt Nam. Tín hiệu được cập nhật thường xuyên và kèm theo giải thích ngắn gọn về cơ sở đưa ra quyết định.',
    'quant-h3-2': 'Phân tích factor model & screening cổ phiếu',
    'quant-p3': 'Sử dụng mô hình factor-based để phân loại cổ phiếu theo tiêu chí giá trị, tăng trưởng, chất lượng và động lượng. Hỗ trợ nhà đầu tư lọc danh mục đầu tư phù hợp với chiến lược cá nhân hoặc tổ chức.',
    'quant-h3-3': 'Machine learning & dự báo xu hướng',
    'quant-p4': 'Áp dụng thuật toán machine learning để nhận diện mẫu hình và dự báo xu hướng ngắn và trung hạn. Hệ thống liên tục được tinh chỉnh để phù hợp với biến động thị trường Việt Nam.',
    'quant-h3-4': 'Báo cáo định kỳ & quản lý rủi ro',
    'quant-p5': 'Cung cấp báo cáo định kỳ về danh mục, hiệu suất và biến động thị trường, kèm khuyến nghị điều chỉnh theo mức độ chấp nhận rủi ro của nhà đầu tư.',
    'quant-h2-2': 'Đối tượng sử dụng',
    'quant-li-1': 'Nhà đầu tư cá nhân muốn nâng cao hiệu suất danh mục',
    'quant-li-2': 'Quỹ đầu tư và tổ chức tài chính cần tín hiệu định lượng bổ sung',
    'quant-li-3': 'Chuyên gia phân tích muốn đa dạng hóa công cụ nghiên cứu',
    'quant-li-4': 'Doanh nhân có nguồn vốn dư muốn đầu tư có chiến lược',
    'quant-h2-3': 'Lý do chọn AI Era cho phân tích định lượng',
    'quant-li-5': '<strong>Chuyên sâu thị trường Việt Nam:</strong> Mô hình được xây dựng và hiệu chỉnh dựa trên đặc thù thị trường chứng khoán nội địa.',
    'quant-li-6': '<strong>Minh bạch rõ ràng:</strong> Mỗi tín hiệu đều có cơ sở dữ liệu và lý giải minh bạch.',
    'quant-li-7': '<strong>Kết hợp AI và con người:</strong> Công nghệ hỗ trợ, quyết định cuối cùng thuộc về nhà đầu tư.',
    'quant-li-8': '<strong>Cập nhật liên tục:</strong> Hệ thống theo dõi và tinh chỉnh mô hình theo biến động thị trường.',
    'quant-h2-4': 'Liên hệ tư vấn',
    'quant-p6': 'Bạn muốn biết thêm về dịch vụ phân tích định lượng và tín hiệu chứng khoán Việt Nam? Liên hệ với AI Era để nhận tư vấn chi tiết về gói dịch vụ phù hợp với chiến lược đầu tư của bạn.',
    'quant-quote': 'AI Era — Intelligence in motion. Đưa dữ liệu vào từng quyết định đầu tư.',

    // 6. thiet-ke-website-chuan-seo
    'seo-meta-desc': 'AI Era — Thiết kế website doanh nghiệp chuẩn SEO & AI SEO: kiến trúc semantic, tốc độ cao, tối ưu AI discovery.',
    'seo-meta-title': 'Thiết kế website chuẩn SEO & AI SEO — AI Era',
    'seo-h1': 'Thiết kế website doanh nghiệp chuẩn SEO & AI SEO — Hiện diện bền vững trên Google và AI Search',
    'seo-p1': 'AI Era thiết kế website doanh nghiệp với kiến trúc semantic-first, tốc độ tải tối ưu và tối ưu AI discovery, giúp doanh nghiệp không chỉ được tìm thấy trên Google mà còn xuất hiện trong AI Overviews, ChatGPT, Perplexity và các công cụ tìm kiếm AI.',
    'seo-h2-1': 'Thiết kế website chuẩn SEO',
    'seo-h3-1': 'Kiến trúc thông tin rõ ràng',
    'seo-p2': 'Thiết kế cấu trúc website với heading hierarchy hợp lý, breadcrumb, internal linking và phân cấp nội dung logic, giúp công cụ tìm kiếm hiểu và đánh giá đúng vai trò của từng trang.',
    'seo-h3-2': 'Tối ưu kỹ thuật (Technical SEO)',
    'seo-p3': 'Tối ưu tốc độ tải, Core Web Vitals, schema markup, hreflang (nếu cần), canonical, XML sitemap và robots.txt theo chuẩn Google. Website được kiểm tra trước khi bàn giao.',
    'seo-h3-3': 'Trải nghiệm người dùng (UX) & tương thích di động',
    'seo-p4': 'Thiết kế responsive, điều hướng trực quan, form tối ưu chuyển đổi, đảm bảo trải nghiệm nhất quán trên desktop và mobile.',
    'seo-h3-4': 'Bảo mật & vận hành',
    'seo-p5': 'Cấu hình HTTPS, header bảo mật, sao lưu định kỳ và kế hoạch bảo trì để website hoạt động ổn định lâu dài.',
    'seo-h2-2': 'AI SEO & AI discovery',
    'seo-h3-5': 'Tối ưu cho AI Overviews & AI Mode',
    'seo-p6': 'Tối ưu nội dung theo mô hình AI-first: trả lời trực tiếp câu hỏi người dùng, cấu trúc hóa dữ liệu, làm rõ entity và mối liên hệ giữa các khái niệm, giúp AI công cụ dễ dàng trích dẫn nguồn.',
    'seo-h3-6': 'Schema markup & structured data',
    'seo-p7': 'Triển khai schema phù hợp (Organization, Service, FAQ, Article, Product...) giúp công cụ tìm kiếm hiểu chính xác nội dung và tăng khả năng hiển thị đa dạng.',
    'seo-h3-7': 'Entity & topical authority',
    'seo-p8': 'Xây dựng cụm nội dung chuyên sâu (content cluster) xung quanh chủ đề cốt lõi, giúp website được AI công cụ nhận diện là nguồn chuyên gia đáng tin cậy.',
    'seo-h2-3': 'Quy trình thiết kế website tại AI Era',
    'seo-li-1': '<strong>Nghiên cứu & chiến lược:</strong> Phân tích đối thủ, từ khóa mục tiêu và hành trình khách hàng.',
    'seo-li-2': '<strong>Thiết kế & xây dựng:</strong> Thiết kế UI/UX và phát triển website chuẩn SEO cơ bản.',
    'seo-li-3': '<strong>Tối ưu nội dung & AI SEO:</strong> Viết nội dung theo E-E-A-T, tối ưu cấu trúc và schema.',
    'seo-li-4': '<strong>Kiểm tra & bàn giao:</strong> Kiểm tra kỹ thuật, tốc độ, SEO và AI discovery trước khi bàn giao.',
    'seo-li-5': '<strong>Bảo trì & cải tiến:</strong> Theo dõi hiệu suất, cập nhật nội dung và tối ưu liên tục.',
    'seo-h2-4': 'Liên hệ tư vấn',
    'seo-p9': 'Bạn cần thiết kế website doanh nghiệp chuẩn SEO và AI SEO? Liên hệ AI Era để nhận báo giá và lộ trình phù hợp.',
    'seo-quote': 'AI Era — Intelligence in motion. Website không chỉ đẹp, mà còn được tìm thấy đúng người.',

    // Contact footer
    'footer-kicker': 'LIÊN HỆ VỚI CHÚNG TÔI',
    'footer-title': 'Kết nối ngay với AI Era',
    'footer-chat-now': 'Chat ngay',
    'footer-phone-label': 'Điện thoại',
    'footer-subtitle': 'INTELLIGENCE ECOSYSTEM',
    'footer-back-top': '↑ VỀ ĐẦU TRANG'
  },
  en: {
    'back-link': 'Return to AI Era Ecosystem',
    // 1. ai-automation-ai-agent
    'auto-meta-desc': 'AI Era — AI Automation & AI Agent: automate business processes, deploy AI Agents for customer support and multi-step tasks.',
    'auto-meta-title': 'AI Automation & AI Agent — AI Era',
    'auto-h1': 'AI Automation & AI Agent — Smart Automation, Optimised Enterprise Workflows',
    'auto-p1': 'AI Era delivers bespoke AI Automation solutions and custom AI Agents, helping businesses automate repetitive workflows, enhance team productivity, and scale operations without a proportional increase in headcount.',
    'auto-h2-1': 'AI Automation',
    'auto-h3-1': 'Workflow Automation',
    'auto-p2': 'Design and integrate automated workflows connecting enterprise tools, systems, and platforms — from order processing and customer care to automated reporting.',
    'auto-h3-2': 'System Integration',
    'auto-p3': 'Bridge data and synchronize interactions across management software, CRM, ERP, e-commerce platforms, and marketing channels to eliminate manual data entry and minimize errors.',
    'auto-h3-3': 'Supervised Automation (Human-in-the-loop)',
    'auto-p4': 'Establish automated processes with human checkpoints, ensuring top-tier output quality and corporate policy compliance.',
    'auto-h2-2': 'AI Agent',
    'auto-h3-4': 'Customer Support Agents',
    'auto-p5': 'Deploy intelligent agents capable of consulting, troubleshooting, and assisting customers 24/7 across websites, Messenger, Zalo, and other channels.',
    'auto-h3-5': 'Complex Task & Operations Agents',
    'auto-p6': 'Engineer autonomous agents capable of planning, tool invocation, state tracking, and executing multi-step workflows: from report generation and data analytics to internal task execution.',
    'auto-h3-6': 'Omnichannel Agents',
    'auto-p7': 'Implement agents that operate consistently across touchpoints, preserving context and delivering seamless customer experiences.',
    'auto-h2-3': 'Key Benefits of Deploying AI Automation & Agents with AI Era',
    'auto-li-1': '<strong>Operational Velocity:</strong> Reduce manual handling time and elevate team throughput.',
    'auto-li-2': '<strong>Cost Efficiency:</strong> Automate repetitive processes to reallocate talent towards strategic priorities.',
    'auto-li-3': '<strong>Agile Scalability:</strong> Automated systems and agents handle massive workloads without adding overhead headcount.',
    'auto-li-4': '<strong>Centralized Auditability:</strong> Every action is logged, easy to track, reconcile, and continuously optimize.',
    'auto-h2-4': 'Contact for Consultation',
    'auto-p8': 'Looking for workflow automation or custom AI Agent deployment for your business? Contact AI Era for an assessment and tailored solution proposal.',
    'auto-quote': 'AI Era — Intelligence in motion. Transforming manual workflows into self-learning, self-running systems.',

    // 2. digital-marketing-ai-content
    'mkt-meta-desc': 'AI Era — Omnichannel Digital Marketing & AI Content: Meta, TikTok, Google Maps ads, automated multi-platform content with AI.',
    'mkt-meta-title': 'Digital Marketing & AI Content — AI Era',
    'mkt-h1': 'Omnichannel Digital Marketing & AI Content — Comprehensive Growth with AI and Data',
    'mkt-p1': 'AI Era provides full-suite digital marketing services combining omnichannel ad campaigns with AI-driven content automation, enabling businesses to engage targeted prospects, cut content production time, and maximize ROI.',
    'mkt-h2-1': 'Cross-Platform Advertising',
    'mkt-h3-1': 'Meta Ads (Facebook, Instagram, Threads)',
    'mkt-p2': 'Setup and optimize ad campaigns across the Meta ecosystem: precision audience targeting, creative optimization, A/B testing, and budget management to achieve optimal CPA/ROAS.',
    'mkt-h3-2': 'TikTok Ads',
    'mkt-p3': 'Create and run high-engagement TikTok campaigns tailored for short-form trends and dynamic user behaviors, rapidly amplifying brand reach.',
    'mkt-h3-3': 'Google Ads & Google Maps',
    'mkt-p4': 'Google Search, Google Shopping, and Google Maps listing optimization, capturing intent-driven traffic precisely when customers are ready to buy or visit.',
    'mkt-h3-4': 'Goal-Driven Optimization',
    'mkt-p5': 'Each channel is structured and optimized for specific milestones: brand awareness, lead capture, sales conversion, or community engagement.',
    'mkt-h2-2': 'AI Content & Auto-Distribution',
    'mkt-h3-5': 'Automated AI Content Generation',
    'mkt-p6': 'Harness generative AI for articles, product descriptions, video scripts, social copy, and email sequences with brand voice consistency and rapid turnaround.',
    'mkt-h3-6': 'Multi-Platform Content Hub',
    'mkt-p7': 'Deploy automated distribution hubs publishing simultaneously across websites, social pages, TikTok, Instagram, Threads, LinkedIn — engaging audiences at every touchpoint.',
    'mkt-h3-7': 'Strategic Content Planning',
    'mkt-p8': 'Develop data-driven content calendars aligned with business objectives, seasonal trends, and analytics to continually elevate performance.',
    'mkt-h2-3': 'Why Choose AI Era for Digital Marketing?',
    'mkt-li-1': '<strong>Data-Driven Mindset:</strong> Every campaign decision is backed by analytics, not guesswork.',
    'mkt-li-2': '<strong>Omnichannel Synergy:</strong> Unified messaging and performance across platforms.',
    'mkt-li-3': '<strong>Strategic Automation:</strong> AI accelerates content generation while experts govern quality and strategy.',
    'mkt-li-4': '<strong>Transparent Reporting:</strong> Clear metrics on spend, efficiency, and actionable recommendations per channel.',
    'mkt-h2-4': 'Contact for Consultation',
    'mkt-p9': 'Ready to accelerate digital marketing and automate content for your enterprise? Reach out to AI Era for an actionable strategic blueprint.',
    'mkt-quote': 'AI Era — Intelligence in motion. Connecting brands to the right audience, at the right time, on the right channels.',

    // 3. landing-page-hosting
    'land-meta-desc': 'AI Era — High-converting Landing Page design with Free Hosting, rapid campaign deployment.',
    'land-meta-title': 'Landing Page & Hosting — AI Era',
    'land-h1': 'High-Converting Landing Page Design & Free Hosting — Maximum Conversion, Optimized Costs',
    'land-p1': 'AI Era crafts high-converting landing pages tailored for ad campaigns, product launches, lead generation, and promotions, bundled with free premium hosting for effortless, infrastructure-free deployment.',
    'land-h2-1': 'Landing Page Design',
    'land-h3-1': 'Conversion-Centric Architecture',
    'land-p2': 'Each landing page is laser-focused on a single objective: sign up, download, inquiry, or purchase. Visual hierarchy, color psychology, and CTAs are built to drive conversions.',
    'land-h3-2': 'Speed & UX Optimization',
    'land-p3': 'Engineered with optimized assets, clean code, and fast load times to slash bounce rates and elevate Quality Scores across Google and Meta ad platforms.',
    'land-h3-3': 'Fully Responsive Design',
    'land-p4': 'Flawless responsive behavior across mobile, tablet, and desktop — wherever your target prospects discover your ads.',
    'land-h3-4': 'A/B Testing & Continuous Improvement',
    'land-p5': 'Support for variant testing (A/B) to test headlines, visuals, and CTAs, iteratively optimizing based on live conversion data.',
    'land-h2-2': 'Free Hosting',
    'land-h3-5': 'Reliable Cloud Infrastructure',
    'land-p6': 'High-uptime hosting with native HTTPS, automated backups, and fundamental security protections, keeping your campaigns running smoothly around the clock.',
    'land-h3-6': 'Rapid Deployment',
    'land-p7': 'Fast turnaround to get your page live with custom domains, SSL certificates, and tracking scripts configured out of the box.',
    'land-h3-7': 'Zero Platform Lock-in',
    'land-p8': 'You retain full ownership of code and data, avoiding closed third-party traps and enabling effortless upgrades down the line.',
    'land-h2-3': 'When Do You Need a Dedicated Landing Page?',
    'land-li-1': 'Running paid campaigns on Meta, Google Ads, or TikTok Ads',
    'land-li-2': 'Launching a new product, service, or feature',
    'land-li-3': 'Capturing leads from promotional events or webinars',
    'land-li-4': 'Targeting a distinct niche or persona with tailored messaging',
    'land-h2-4': 'Contact for Consultation',
    'land-p9': 'Need a bespoke landing page with complimentary hosting? Contact AI Era for design proposals and swift deployment.',
    'land-quote': 'AI Era — Intelligence in motion. One page, one focus, one successful campaign.',

    // 4. phan-mem-quan-ly-doanh-nghiep
    'pm-meta-desc': 'AI Era — Vertical business management software: Spa, Nail, Aesthetic Clinic, Dental, Medical Clinic, Gym.',
    'pm-meta-title': 'Industry Management Software — AI Era',
    'pm-h1': 'Enterprise Management Software — Core Solutions Tailored for Every Vertical',
    'pm-p1': 'AI Era delivers specialized management software tailored for vertical industries: Spa, Nail Salons, Aesthetic Clinics, Dental Practices, Medical Clinics, and Fitness Centers. Each solution automates operations, client management, staff, services, and finances seamlessly.',
    'pm-h2-1': 'iSpa — Spa Management',
    'pm-ispa-1': 'Manage appointments, service catalogs, therapists, and treatment rooms',
    'pm-ispa-2': 'Track treatment regimens, client histories, and personalized care notes',
    'pm-ispa-3': 'Inventory control, supply intake/dispatch, and point-of-sale invoicing',
    'pm-ispa-4': 'Revenue reporting, therapist commissions, and client retention rates',
    'pm-ispa-5': 'Online booking integration with automated SMS/Zalo appointment reminders',
    'pm-h2-2': 'iNail — Nail Salon Management',
    'pm-inail-1': 'Appointment scheduling, nail technicians, and specialized service management',
    'pm-inail-2': 'Track nail art preferences, color histories, and VIP client profiles',
    'pm-inail-3': 'Inventory tracking for polish collections, nail accessories, and tools',
    'pm-inail-4': 'Technician revenue share, daily reconciliations, and service breakdowns',
    'pm-inail-5': 'Direct booking integration via social media pages, website, or chat apps',
    'pm-h2-3': 'iBeauty — Aesthetic Clinic Management',
    'pm-ibeauty-1': 'Manage clinical treatment plans, doctors, aesthetic technicians, and suites',
    'pm-ibeauty-2': 'Track skin progress, treatment protocols, and before/after outcomes',
    'pm-ibeauty-3': 'Cosmeceutical inventory, medical consumables, and billing management',
    'pm-ibeauty-4': 'Service conversion analytics, procedure efficiency, and financial reporting',
    'pm-ibeauty-5': 'Consultation bookings and automated post-treatment care workflows',
    'pm-h2-4': 'iDental — Dental Clinic Management',
    'pm-idental-1': 'Manage dentist schedules, treatment operatories, and dental procedures',
    'pm-idental-2': 'Electronic dental records, treatment plans, and integrated X-ray charts',
    'pm-idental-3': 'Medical supply inventory, expiry tracking, and procurement controls',
    'pm-idental-4': 'Dentist performance analytics, treatment revenues, and recall rates',
    'pm-idental-5': 'Automated appointment reminders and post-procedure check-in notifications',
    'pm-h2-5': 'iClinic — Polyclinic & Medical Practice Management',
    'pm-iclinic-1': 'Doctor scheduling, specialty departments, and consultation rooms',
    'pm-iclinic-2': 'Electronic medical records (EMR), e-prescriptions, lab orders, and vital tracking',
    'pm-iclinic-3': 'Pharmacy inventory, medical consumables, and health insurance claims',
    'pm-iclinic-4': 'Consultation volume trends, physician productivity, and department analytics',
    'pm-iclinic-5': 'Online patient portal, automated reminders, and follow-up care schedules',
    'pm-h2-6': 'iGym — Fitness & Gym Management',
    'pm-igym-1': 'Manage memberships, member profiles, personal trainers, and class timetables',
    'pm-igym-2': 'Track fitness assessments, body metrics, and personal training milestones',
    'pm-igym-3': 'Fee collection, membership renewals, and promotional pass management',
    'pm-igym-4': 'Revenue dashboards, member retention ratios, and trainer performance metrics',
    'pm-igym-5': 'QR code self check-in, online pass purchases, and app push notifications',
    'pm-h2-7': 'Why Choose AI Era Industry Solutions?',
    'pm-li-1': '<strong>Vertical-Specific:</strong> Engineered for distinct operational nuances, not generic one-size-fits-all software.',
    'pm-li-2': '<strong>Workflow Automation:</strong> Cut down manual overhead, prevent human error, and accelerate daily operations.',
    'pm-li-3': '<strong>Intelligent Analytics:</strong> Track revenues, staff efficiency, and customer patterns to make data-backed decisions.',
    'pm-li-4': '<strong>Swift Onboarding:</strong> The AI Era team provides complete setup, onboarding, and continuous operational support.',
    'pm-h2-8': 'Contact for Consultation',
    'pm-p2': 'Interested in adopting specialized vertical software for your business? Connect with AI Era for personalized demos and consultations.',
    'pm-quote': 'AI Era — Intelligence in motion. Software built not just to manage, but to empower business growth.',

    // 5. phan-tich-dinh-luong-chung-khoan
    'quant-meta-desc': 'AI Era — Quantitative Stock Analysis in Vietnam: factor-based models, machine learning, buy/sell signals and risk management.',
    'quant-meta-title': 'Quantitative Stock Analysis — AI Era',
    'quant-h1': 'Quantitative Stock Analysis for Vietnam — Data Signals, Precision Decisions',
    'quant-p1': 'AI Era delivers quantitative analysis and signal intelligence tailored for the Vietnamese stock market, synthesizing historical data, factor-based modeling, machine learning, and disciplined risk management to empower scientific investing.',
    'quant-h2-1': 'Core Services',
    'quant-h3-1': 'Daily Quantitative Signals',
    'quant-p2': 'Automated market data processing generating actionable buy/sell signals backtested on Vietnamese financial markets, delivered with clear technical rationales.',
    'quant-h3-2': 'Factor Models & Stock Screening',
    'quant-p3': 'Classify equities using multi-factor frameworks (Value, Growth, Quality, Momentum) to construct high-conviction portfolios aligned with investor mandates.',
    'quant-h3-3': 'Machine Learning & Trend Forecasting',
    'quant-p4': 'Deploy machine learning algorithms for short-to-medium-term pattern recognition and regime shifts, dynamically calibrated to market cycles.',
    'quant-h3-4': 'Periodic Reports & Risk Management',
    'quant-p5': 'Receive structured portfolio health checks, performance attribution, volatility alerts, and risk-adjusted rebalancing recommendations.',
    'quant-h2-2': 'Target Clients',
    'quant-li-1': 'Individual investors seeking disciplined alpha and enhanced risk-adjusted returns',
    'quant-li-2': 'Investment funds and institutions requiring independent quantitative overlays',
    'quant-li-3': 'Equity research analysts seeking advanced screening and modeling tools',
    'quant-li-4': 'Business owners and capital allocators looking for strategic investment frameworks',
    'quant-h2-3': 'Why Choose AI Era for Quantitative Analysis?',
    'quant-li-5': '<strong>Vietnam Market Specialization:</strong> Models engineered specifically around domestic market microstructure.',
    'quant-li-6': '<strong>Complete Transparency:</strong> Every signal is supported by verifiable data points and clear criteria.',
    'quant-li-7': '<strong>Human + AI Synergy:</strong> Powerful computational models providing intelligence for human decision-making.',
    'quant-li-8': '<strong>Continuous Calibration:</strong> Ongoing model refinement to stay ahead of evolving market regimes.',
    'quant-h2-4': 'Contact for Consultation',
    'quant-p6': 'Ready to explore quantitative intelligence for the Vietnamese stock market? Connect with AI Era for detailed advisory on investment strategies.',
    'quant-quote': 'AI Era — Intelligence in motion. Grounding every investment decision in empirical data.',

    // 6. thiet-ke-website-chuan-seo
    'seo-meta-desc': 'AI Era — SEO & AI SEO Enterprise Web Design: semantic architecture, blazing speed, optimized for AI discovery.',
    'seo-meta-title': 'SEO & AI SEO Web Design — AI Era',
    'seo-h1': 'Enterprise Web Design for SEO & AI Discovery — Enduring Visibility across Google and AI Search',
    'seo-p1': 'AI Era crafts enterprise websites with semantic-first architecture, high-performance optimization, and AI discovery readiness — ensuring your brand ranks not just on Google, but thrives in AI Overviews, ChatGPT, Perplexity, and emerging AI search engines.',
    'seo-h2-1': 'SEO-Optimized Web Architecture',
    'seo-h3-1': 'Intuitive Information Architecture',
    'seo-p2': 'Engineered with clean heading hierarchies, logical breadcrumbs, internal link graphs, and topical structure so search engines effortlessly comprehend and index your content.',
    'seo-h3-2': 'Technical SEO Excellence',
    'seo-p3': 'Optimized for Core Web Vitals, rich schema markup, hreflang, canonical URLs, XML sitemaps, and robots.txt strictly adhering to modern search engine standards.',
    'seo-h3-3': 'User Experience (UX) & Mobile Mastery',
    'seo-p4': 'Fully responsive layouts, effortless navigation, and conversion-focused touchpoints guaranteeing flawless consistency across desktop and mobile.',
    'seo-h3-4': 'Security & Ongoing Reliability',
    'seo-p5': 'Hardened HTTPS, secure response headers, scheduled backups, and proactive maintenance frameworks for uninterrupted operational longevity.',
    'seo-h2-2': 'AI SEO & AI Discovery Engine',
    'seo-h3-5': 'Optimized for AI Overviews & Generative Search',
    'seo-p6': 'Content formatted for AI engines: direct answers, clear entity definitions, and interconnected knowledge graphs making it effortless for AI agents to cite your brand as an authoritative source.',
    'seo-h3-6': 'Rich Schema Markup & Structured Data',
    'seo-p7': 'Deploy comprehensive schema (Organization, Service, FAQ, Article, Product) delivering unambiguous machine-readable semantics for search engines.',
    'seo-h3-7': 'Topical Authority & Entity Strategy',
    'seo-p8': 'Construct in-depth content clusters around your core domain, cementing your website as an indisputable expert resource in the eyes of AI search algorithms.',
    'seo-h2-3': 'Our Web Development Process',
    'seo-li-1': '<strong>Research & Strategy:</strong> Competitor analysis, keyword intent discovery, and user journey mapping.',
    'seo-li-2': '<strong>Design & Development:</strong> High-end UI/UX design and semantic development adhering to technical SEO standards.',
    'seo-li-3': '<strong>Content & AI SEO:</strong> E-E-A-T-aligned copywriting, structured schema, and entity optimization.',
    'seo-li-4': '<strong>Quality Assurance:</strong> Rigorous technical audits for performance, mobile readiness, and AI discovery prior to launch.',
    'seo-li-5': '<strong>Maintenance & Evolution:</strong> Ongoing performance telemetry, content updates, and continuous optimization.',
    'seo-h2-4': 'Contact for Consultation',
    'seo-p9': 'Ready to build an SEO and AI-search optimized enterprise website? Contact AI Era for a customized quote and roadmap.',
    'seo-quote': 'AI Era — Intelligence in motion. Websites crafted not only to look stunning, but to be discovered by the right audience.',

    // Contact footer
    'footer-kicker': 'GET IN TOUCH',
    'footer-title': 'Connect with AI Era',
    'footer-chat-now': 'Chat now',
    'footer-phone-label': 'Phone',
    'footer-subtitle': 'INTELLIGENCE ECOSYSTEM',
    'footer-back-top': '↑ BACK TO TOP'
  }
};

export function applyDetailLang(lang) {
  const dict = detailTranslations[lang];
  if (!dict) return;

  document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';

  // Apply to [data-i18n]
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) {
      if (dict[key].includes('<') && dict[key].includes('>')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Update title / meta if marked
  const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
  if (titleKey && dict[titleKey]) {
    document.title = dict[titleKey];
  }
  const descMeta = document.querySelector('meta[name="description"]');
  const descKey = descMeta?.getAttribute('data-i18n');
  if (descKey && dict[descKey]) {
    descMeta.setAttribute('content', dict[descKey]);
  }

  // Update active state on buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

const THEME_KEY = 'aiera_theme';

export function getDetailTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
}

export function setDetailTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
  });
  try { localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark'); } catch {}
}

export function initDetailPageI18n() {
  const currentLang = getCurrentLang();
  const currentTheme = getDetailTheme();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-lang');
      setLanguage(target);
      applyDetailLang(target);
    });
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.getAttribute('data-theme-val') || (getDetailTheme() === 'light' ? 'dark' : 'light');
      setDetailTheme(targetTheme);
    });
  });

  applyDetailLang(currentLang);
  setDetailTheme(currentTheme);
}
