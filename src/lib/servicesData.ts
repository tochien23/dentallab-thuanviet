/**
 * Dữ liệu chi tiết về các dịch vụ phục hình nha khoa tại SmileLab Dental
 * Phục vụ cho các route giới thiệu chi tiết dịch vụ: /dich-vu và /dich-vu/[slug]
 */

export interface ServiceAdvantage {
  title: string;
  description: string;
  iconName?: string;
}

export interface ServiceSpecItem {
  label: string;
  value: string;
  note?: string;
}

export interface ServiceProcedureStep {
  step: number;
  title: string;
  duration?: string;
  description: string;
  details?: string[];
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDetail {
  id: string;
  slug: string;
  aliases?: string[];
  name: string;
  shortTitle: string;
  tagline: string;
  category: string;
  heroBadge: string;
  warrantyYears: string;
  warrantyDurationYears: number;
  strength: string;
  priceRange: string;
  estimatedTime: string;
  matchedServiceOption: string;
  overview: string;
  highlightPoints: string[];
  indications: string[];
  contraindications: string[];
  advantages: ServiceAdvantage[];
  limitations: string[];
  specs: ServiceSpecItem[];
  procedure: ServiceProcedureStep[];
  faqs: ServiceFaq[];
  comparison: {
    strengthRating: number; // 1-5
    aestheticRating: number; // 1-5
    longevityRating: number; // 1-5
    prepInvasiveness: string; // Mức độ xâm lấn/mài răng
    idealFor: string;
  };
}

export const DENTAL_SERVICES_DETAIL: ServiceDetail[] = [
  {
    id: "zirconia",
    slug: "zirconia",
    aliases: ["rang-su-zirconia"],
    name: "Răng Sứ Toàn Sứ Zirconia Cao Cấp",
    shortTitle: "Răng sứ Zirconia",
    tagline: "Đỉnh cao độ bền cơ học & Thẩm mỹ sinh học tự nhiên không viền đen",
    category: "Răng toàn sứ",
    heroBadge: "Lựa chọn hàng đầu",
    warrantyYears: "10 – 15 năm",
    warrantyDurationYears: 10,
    strength: "1200 – 1560 MPa (Gấp 6-8 lần răng thật)",
    priceRange: "Từ 3.500.000đ – 6.500.000đ / răng",
    estimatedTime: "2 – 3 buổi hẹn (2 – 4 ngày)",
    matchedServiceOption: "Răng sứ Zirconia",
    overview:
      "Răng sứ Zirconia là dòng phục hình toàn sứ đỉnh cao được sản xuất 100% từ khối sứ Zirconium Dioxide (ZrO2) nguyên chất thông qua công nghệ tiện kỹ thuật số CAD/CAM hiện đại. Sở hữu độ chịu lực uốn gãy vượt trội lên đến 1560 MPa kết hợp cùng khả năng tương thích sinh học hoàn hảo, răng sứ Zirconia giải quyết triệt để vấn đề thâm đen viền nướu, hôi miệng hay kích ứng kim loại của các thế hệ răng sứ truyền thống, mang lại nụ cười rạng rỡ và tuổi thọ ăn nhai bền vững suốt nhiều thập kỷ.",
    highlightPoints: [
      "100% sứ Zirconia nguyên khối, không lẫn tạp chất kim loại",
      "Độ cứng 1560 MPa, thoải mái ăn nhai đồ cứng, dai mà không lo nứt mẻ",
      "Độ trong mờ tự nhiên, khúc xạ ánh sáng đa chiều sống động như răng thật",
      "Bảo hành điện tử chính hãng 10-15 năm, tra cứu mã QR minh bạch",
      "Sản xuất trực tiếp tại Lab SmileLab với máy phay CAD/CAM 5 trục chuẩn Micromet",
    ],
    indications: [
      "Răng bị sâu lớn, mẻ, vỡ thân răng không thể phục hồi bằng phương pháp trám thông thường",
      "Răng sau khi điều trị tủy cần bọc mão sứ bảo vệ mô răng thật khỏi gãy giòn",
      "Răng xỉn màu, ố vàng nặng, nhiễm kháng sinh Tetracycline không thể tẩy trắng",
      "Cần làm cầu răng sứ phục hình vùng răng cối lớn chịu áp lực nhai chính",
      "Khách hàng muốn hàm răng đều đẹp, chuẩn khớp cắn và tự nhiên trọn đời",
    ],
    contraindications: [
      "Răng lung lay độ 3, độ 4 do viêm nha chu nặng (cần điều trị ổn định nha chu trước)",
      "Sai lệch khớp cắn quá phức tạp dạng xương (khuyến nghị kết hợp chỉnh nha tiền phục hình)",
    ],
    advantages: [
      {
        title: "Độ bền & chịu lực phi thường",
        description:
          "Chịu lực uốn uốn gãy từ 1200 đến 1560 MPa, gấp 6-8 lần răng tự nhiên. Bạn hoàn toàn an tâm ăn nhai đồ dai, cứng mà không lo sứt mẻ hay vỡ mão.",
        iconName: "Shield",
      },
      {
        title: "Tuyệt đối không đen viền nướu",
        description:
          "Cấu tạo hoàn toàn từ sứ sinh học nguyên khối, trơ hóa học tuyệt đối trong môi trường nước bọt, không oxy hóa và không làm đổi màu viền lợi sau nhiều năm.",
        iconName: "Sparkles",
      },
      {
        title: "Thẩm mỹ đa lớp tinh tế",
        description:
          "Độ trong quang học đạt 43-49%, mô phỏng hoàn hảo từ cổ răng, thân răng đến rìa cắn trong mờ tự nhiên, không bị đục bóng khi có ánh đèn rọi trực tiếp.",
        iconName: "Eye",
      },
      {
        title: "Tương thích sinh học 100%",
        description:
          "Vật liệu Zirconia được ứng dụng cả trong khớp háng nhân tạo y khoa, hoàn toàn êm dịu với mô nướu, không gây hôi miệng và không gây dị ứng nhiệt nóng lạnh.",
        iconName: "HeartPulse",
      },
      {
        title: "Bảo tồn tủy răng tối đa",
        description:
          "Nhờ độ mỏng và độ chịu lực cao, bác sĩ chỉ cần mài một lớp cùi răng siêu mỏng từ 0.6 - 1.0mm, hạn chế tối đa xâm lấn và bảo vệ tủy răng khỏe mạnh.",
        iconName: "CheckCircle",
      },
    ],
    limitations: [
      "Chi phí đầu tư ban đầu cao hơn so với dòng răng sứ kim loại truyền thống",
      "Đòi hỏi máy móc CAD/CAM chuyên dụng và tay nghề bác sĩ mài cùi chính xác cao",
    ],
    specs: [
      { label: "Vật liệu phôi sứ", value: "Zirconium Dioxide (ZrO2) đa lớp chính hãng (Cercon, Katana, Lava Esthetic)" },
      { label: "Độ chịu uốn gãy", value: "1200 – 1560 MPa" },
      { label: "Độ trong mờ (Translucency)", value: "43% – 49%" },
      { label: "Độ dày thành tối thiểu", value: "0.6 mm" },
      { label: "Công nghệ gia công", value: "Phay tiện kỹ thuật số CAD/CAM 5 trục" },
      { label: "Thời hạn bảo hành", value: "10 – 15 năm (Thẻ điện tử QR chính hãng)" },
      { label: "Vị trí phục hình tối ưu", value: "Răng cửa, răng nanh, răng tiền cối và răng cối lớn toàn hàm" },
    ],
    procedure: [
      {
        step: 1,
        title: "Thăm khám & Chụp phim 3D",
        duration: "Buổi 1 (30-45 phút)",
        description:
          "Bác sĩ chụp phim toàn cảnh Panorama hoặc CT ConeBeam để khảo sát chân răng, tủy răng và mật độ xương, tư vấn dáng răng phù hợp với khuôn mặt.",
        details: ["Chụp phim X-quang kỹ thuật số", "Kiểm tra tình trạng tủy và khớp cắn", "Lập phác đồ điều trị cá nhân hóa"],
      },
      {
        step: 2,
        title: "Sửa soạn cùi răng & Lấy dấu 3D",
        duration: "Buổi 1 (45-60 phút)",
        description:
          "Vệ sinh khoang miệng, gây tê nhẹ nhàng và mài sửa soạn cùi răng với đường hoàn tất chuẩn xác. Quét dấu hàm kỹ thuật số 3D gửi trực tiếp về Lab SmileLab.",
        details: ["Gây tê không đau", "Mài chỉnh tối thiểu bảo tồn tủy", "Gắn răng tạm bảo vệ thẩm mỹ ngay lập tức"],
      },
      {
        step: 3,
        title: "Thiết kế & Chế tác tại Lab SmileLab",
        duration: "1 – 2 ngày tại Lab",
        description:
          "Kỹ thuật viên nha khoa thiết kế form răng trên phần mềm 3D CAD và tiện phôi sứ nguyên khối trên máy phay 5 trục CAM, nung kết ở 1500°C và đắp lớp sứ thẩm mỹ.",
        details: ["Thiết kế chuẩn khớp cắn sinh lý", "Nung kết tinh thể Zirconia đạt độ cứng cực đại", "Tráng men bóng chống bám bẩn"],
      },
      {
        step: 4,
        title: "Thử răng, Tinh chỉnh & Gắn vĩnh viễn",
        duration: "Buổi 2 (30-45 phút)",
        description:
          "Bác sĩ cho khách hàng soi gương thử màu sắc, độ khít sát và kiểm tra cảm giác cắn nhai. Khi khách hàng hoàn toàn ưng ý, tiến hành gắn cố định bằng xi măng y khoa chuyên dụng.",
        details: ["Thử răng kiểm tra thẩm mỹ và nụ cười", "Cân chỉnh tiếp xúc điểm chạm khớp cắn", "Chiếu đèn quang trùng hợp gắn kết dính"],
      },
      {
        step: 5,
        title: "Kích hoạt Bảo Hành Điện Tử & Tái khám",
        duration: "Buổi 2 (15 phút)",
        description:
          "Bàn giao thẻ bảo hành điện tử SmileLab Dental tích hợp mã QR, hướng dẫn vệ sinh chăm sóc răng miệng và hẹn lịch tái khám định kỳ 6 tháng.",
        details: ["Kích hoạt mã bảo hành trên hệ thống portal", "Kiểm tra tra cứu bảo hành tức thì qua điện thoại", "Tặng bộ kit chăm sóc răng sứ"],
      },
    ],
    faqs: [
      {
        question: "Răng sứ Zirconia có bị đen cổ chân răng sau nhiều năm sử dụng không?",
        answer:
          "Hoàn toàn không. Khác với răng sứ kim loại, Zirconia là vật liệu toàn sứ sinh học 100%, không bị oxy hóa hay phản ứng với enzyme trong nước bọt, đảm bảo viền nướu luôn hồng hào tự nhiên suốt đời.",
      },
      {
        question: "Bọc răng sứ Zirconia có phải lấy tủy răng không?",
        answer:
          "Tại SmileLab Dental, nguyên tắc y đức số 1 là bảo tồn tủy răng tối đa. Nhờ độ mỏng và cứng của phôi Zirconia, bác sĩ chỉ mài một lớp men răng cực mỏng (0.6 - 0.8mm), răng vẫn giữ nguyên tủy sống khỏe mạnh nếu răng chưa bị viêm tủy từ trước.",
      },
      {
        question: "Răng sứ Zirconia có ăn nhai được đồ cứng và đồ dai không?",
        answer:
          "Với độ chịu lực lên tới 1200 - 1560 MPa (răng thật chỉ khoảng 200 MPa), bạn có thể ăn uống hoàn toàn bình thường và tự tin với các món ăn yêu thích mà không sợ gãy vỡ.",
      },
      {
        question: "Quy trình làm răng sứ Zirconia mất bao lâu?",
        answer:
          "Nhờ SmileLab sở hữu hệ thống Labo CAD/CAM tại chỗ, toàn bộ quy trình chỉ mất từ 2 đến 3 ngày (thường gồm 2 buổi hẹn: buổi 1 lấy dấu làm răng tạm, buổi 2 gắn răng chính thức).",
      },
      {
        question: "Chế độ bảo hành điện tử của SmileLab áp dụng như thế nào?",
        answer:
          "Mỗi ca phục hình Zirconia được cấp một mã bảo hành điện tử độc nhất. Khách hàng chỉ cần quét mã QR bằng camera điện thoại hoặc tra cứu tại website để xem nguồn gốc phôi sứ, bác sĩ thực hiện và thời hạn bảo hành từ 10 đến 15 năm.",
      },
    ],
    comparison: {
      strengthRating: 5,
      aestheticRating: 5,
      longevityRating: 5,
      prepInvasiveness: "Ít xâm lấn (0.6 - 1.0mm)",
      idealFor: "Phục hình toàn diện mọi vị trí (răng cửa thẩm mỹ & răng hàm ăn nhai)",
    },
  },
  {
    id: "rang-su-kim-loai",
    slug: "rang-su-kim-loai",
    aliases: ["emax", "kim-loai", "rang-su-titan"],
    name: "Răng Sứ Kim Loại Tiêu Chuẩn (Ceramo-Metal Crown)",
    shortTitle: "Răng sứ Kim Loại",
    tagline: "Giải pháp phục hồi chức năng ăn nhai vững chắc, kinh tế & hiệu quả lâm sàng",
    category: "Răng sứ kim loại",
    heroBadge: "Tiết kiệm chi phí",
    warrantyYears: "3 – 7 năm",
    warrantyDurationYears: 5,
    strength: "450 – 650 MPa",
    priceRange: "Từ 1.200.000đ – 2.500.000đ / răng",
    estimatedTime: "2 buổi hẹn (2 – 3 ngày)",
    matchedServiceOption: "Răng sứ Kim Loại",
    overview:
      "Răng sứ kim loại là phương pháp phục hình truyền thống lâu đời nhưng vẫn giữ vị thế quan trọng nhờ khả năng chịu lực ăn nhai tốt và mức chi phí vô cùng phải chăng. Sản phẩm có cấu trúc kết hợp: khung sườn bên trong đúc từ hợp kim y tế (Co-Cr, Ni-Cr hoặc Titanium) chịu lực tải trọng cao, bên ngoài được phủ nhiều lớp men sứ Ceramco thẩm mỹ cùng màu răng thật. Đây là giải pháp phục hồi tối ưu cho vùng răng hàm phía trong chịu lực nhai chính của khách hàng có ngân sách vừa phải.",
    highlightPoints: [
      "Khung sườn hợp kim chịu lực ăn nhai cứng chắc và ổn định",
      "Chi phí hợp lý, dễ tiếp cận cho mọi gia đình và người lớn tuổi",
      "Khắc phục hiệu quả tình trạng mất răng hoặc răng hàm bị sâu vỡ nặng",
      "Thời gian đúc và nung sứ nhanh chóng, hoàn thiện trong 2-3 ngày",
      "Bảo hành chính hãng điện tử rõ ràng từ 3 đến 7 năm",
    ],
    indications: [
      "Mất răng hoặc vỡ mẻ lớn ở nhóm răng cối, răng hàm phía trong chịu lực nhai chính",
      "Răng hàm đã điều trị tủy cần chụp mão bảo vệ để tránh vỡ cùi khi nhai đồ cứng",
      "Làm cầu răng phục hình cho người mất răng hàm có ngân sách tiết kiệm",
      "Khách hàng lớn tuổi muốn khôi phục khả năng ăn nhai nhanh chóng và chắc chắn",
    ],
    contraindications: [
      "Phục hình vùng răng cửa trước đòi hỏi độ trong mờ thẩm mỹ cao khi giao tiếp",
      "Khách hàng có tiền sử dị ứng hoặc nhạy cảm với thành phần kim loại (Niken/Coban)",
    ],
    advantages: [
      {
        title: "Chi phí kinh tế nhất",
        description:
          "Là dòng răng sứ có mức giá thấp nhất, giúp khách hàng tiết kiệm đáng kể chi phí khi cần bọc nhiều răng hàm hoặc làm cầu răng dài.",
        iconName: "BadgeDollarSign",
      },
      {
        title: "Khả năng chịu lực nhai khỏe",
        description:
          "Lõi khung kim loại cứng cáp đảm bảo khả năng cắn xé và nghiền nát thức ăn vững vàng ở các vị trí răng hàm chịu áp lực lớn.",
        iconName: "Shield",
      },
      {
        title: "Kỹ thuật chế tác thuần thục",
        description:
          "Quy trình đúc khung kim loại và đắp sứ đã được chuẩn hóa qua nhiều thập kỷ, độ ổn định lâm sàng cao và kiểm soát tốt thời gian hoàn thiện.",
        iconName: "Wrench",
      },
      {
        title: "Tái tạo dáng răng vừa vặn",
        description:
          "Lớp men sứ bên ngoài được tạo hình tỉ mỉ theo giải phẫu rãnh mặt nhai của răng tự nhiên, giúp ăn nhai ngon miệng và êm ái.",
        iconName: "Smile",
      },
    ],
    limitations: [
      "Sau 3-5 năm có thể xuất hiện viền đen xám ở nướu do kim loại tiếp xúc axit khoang miệng",
      "Không có độ trong quang học tự nhiên, màu sắc hơi đục nhẹ khi có ánh sáng mạnh rọi vào",
    ],
    specs: [
      { label: "Khung sườn bên trong", value: "Hợp kim y tế Cobalt-Chromium (Co-Cr) hoặc Titanium không chì" },
      { label: "Lớp men sứ bên ngoài", value: "Sứ nha khoa Ceramco III / Vita cao cấp" },
      { label: "Độ chịu lực uốn", value: "450 – 650 MPa" },
      { label: "Độ dày thành răng", value: "1.2 – 1.5 mm" },
      { label: "Thời hạn bảo hành", value: "3 – 7 năm (Bảo hành điện tử SmileLab)" },
      { label: "Vị trí tối ưu khuyến nghị", value: "Răng cối nhỏ và răng cối lớn phía trong (Răng 4, 5, 6, 7)" },
    ],
    procedure: [
      {
        step: 1,
        title: "Khám & Đánh giá chân răng",
        duration: "Buổi 1 (30 phút)",
        description:
          "Kiểm tra mức độ tổn thương của răng hàm, chụp phim X-quang kiểm tra chân răng và tư vấn loại hợp kim phù hợp.",
      },
      {
        step: 2,
        title: "Sửa soạn cùi răng & Lấy dấu thạch cao/3D",
        duration: "Buổi 1 (45 phút)",
        description:
          "Mài chỉnh cùi răng theo góc độ thoát chuẩn y khoa, lấy dấu hàm gửi xưởng SmileLab và lắp răng tạm bảo vệ cùi.",
      },
      {
        step: 3,
        title: "Đúc sườn kim loại & Đắp sứ Ceramco",
        duration: "1 – 2 ngày tại Lab",
        description:
          "Kỹ thuật viên Labo đúc khung kim loại bằng lò cao tần, sau đó đắp từng lớp bột sứ Ceramco và nung hấp chân không.",
      },
      {
        step: 4,
        title: "Thử sườn, Kiểm tra khớp cắn & Gắn cố định",
        duration: "Buổi 2 (30 phút)",
        description:
          "Thử mão sứ vào miệng, kiểm tra độ khít sát cổ răng và điều chỉnh các điểm cộm nhai trước khi gắn bằng xi măng vĩnh viễn.",
      },
      {
        step: 5,
        title: "Kích hoạt bảo hành điện tử & Hướng dẫn vệ sinh",
        duration: "Buổi 2 (15 phút)",
        description:
          "Nhập dữ liệu vào cổng bảo hành SmileLab Portal, cung cấp mã QR cho khách hàng tra cứu thời hạn bảo hành thuận tiện.",
      },
    ],
    faqs: [
      {
        question: "Tại sao răng sứ kim loại lại có nguy cơ bị đen viền nướu?",
        answer:
          "Do môi trường khoang miệng có độ ẩm và enzyme nước bọt, sau một số năm kim loại ở chân răng có thể bị oxy hóa nhẹ, khiến viền nướu sát chân răng hơi ánh xám. Đó là lý do SmileLab luôn khuyến nghị chỉ nên dùng răng sứ kim loại cho vùng răng hàm, không nên dùng cho răng cửa.",
      },
      {
        question: "Răng sứ kim loại có bền không, dùng được bao lâu?",
        answer:
          "Răng sứ kim loại có độ bền trung bình từ 5 đến 7 năm, thậm chí trên 10 năm nếu khách hàng chăm sóc răng miệng tốt, cạo vôi răng định kỳ và không dùng răng cắn mở vật cứng.",
      },
      {
        question: "Răng sứ kim loại có bị dị ứng không?",
        answer:
          "Đa số mọi người dùng bình thường. Nếu khách hàng có cơ địa dị ứng kim loại, SmileLab sẽ tư vấn sử dụng dòng sứ Titan hoặc nâng cấp lên răng toàn sứ Zirconia hoàn toàn tương thích sinh học.",
      },
      {
        question: "Nếu sau này viền nướu bị đen thì có thay lại được không?",
        answer:
          "Hoàn toàn được. Bác sĩ có thể tháo mão sứ kim loại cũ ra một cách nhẹ nhàng và thay thế bằng mão toàn sứ Zirconia mới mà không ảnh hưởng đến cùi răng thật bên trong.",
      },
    ],
    comparison: {
      strengthRating: 4,
      aestheticRating: 3,
      longevityRating: 3,
      prepInvasiveness: "Trung bình (1.2 - 1.5mm)",
      idealFor: "Răng hàm trong cùng cần lực nhai tốt với chi phí tiết kiệm",
    },
  },
  {
    id: "veneer",
    slug: "veneer",
    aliases: ["mat-dan-su-veneer", "dan-su-veneer"],
    name: "Mặt Dán Sứ Veneer Siêu Mỏng (Laminate Veneer)",
    shortTitle: "Mặt dán sứ Veneer",
    tagline: "Đỉnh cao thẩm mỹ nụ cười bảo tồn tối đa - Mỏng nhẹ tinh tế như kính áp tròng",
    category: "Thẩm mỹ bảo tồn",
    heroBadge: "Bảo tồn mô răng tối đa",
    warrantyYears: "7 – 10 năm",
    warrantyDurationYears: 7,
    strength: "400 – 550 MPa",
    priceRange: "Từ 6.000.000đ – 10.000.000đ / răng",
    estimatedTime: "2 – 3 buổi hẹn (3 – 5 ngày)",
    matchedServiceOption: "Mặt dán sứ Veneer",
    overview:
      "Mặt dán sứ Veneer là đỉnh cao của nha khoa thẩm mỹ bảo tồn hiện đại trên thế giới. Với độ siêu mỏng chỉ từ 0.2mm – 0.5mm (tương đương độ mỏng của kính áp tròng), miếng dán sứ được chế tác tinh xảo từ khối sứ thủy tinh Lithium Disilicate và dán cố định lên mặt ngoài của răng thật bằng keo dán sinh học chuyên dụng. Phương pháp này chỉ xử lý một lớp men răng cực mỏng hoặc thậm chí không cần mài, bảo tồn 100% tủy sống và giữ nguyên khớp cắn nguyên bản, đem lại nụ cười rạng ngời tự nhiên.",
    highlightPoints: [
      "Siêu mỏng chỉ từ 0.2 - 0.5mm, bảo tồn tối đa 95-100% mô men răng thật",
      "Bảo tồn tủy sống tuyệt đối, không gây đau nhức hay ê buốt kéo dài",
      "Độ trong bóng ngọc trai tự nhiên, khúc xạ ánh sáng hoàn mỹ như răng thật",
      "Vật liệu sứ thủy tinh Lithium Disilicate siêu bền, không bám màu thực phẩm",
      "Bảo hành điện tử 7-10 năm với công nghệ gắn kết dính quang trùng hợp cao cấp",
    ],
    indications: [
      "Răng thưa, hở kẽ nhẹ giữa các răng cửa làm mất tự tin khi cười",
      "Răng bị ố vàng, nhiễm màu kháng sinh Tetracycline thể nhẹ, không đáp ứng tẩy trắng",
      "Hình thể răng không đều, răng quá ngắn, răng bị mẻ nhẹ ở rìa cắn do chấn thương",
      "Bề mặt men răng bị thiểu sản men, sần sùi hoặc rỗ nhẹ",
      "Khách hàng mong muốn nụ cười sang trọng, tự nhiên chuẩn tỉ lệ vàng mà KHÔNG muốn mài nhỏ răng",
    ],
    contraindications: [
      "Răng chen chúc, khấp khểnh hoặc sai khớp cắn đối đầu nặng (nên niềng răng trước)",
      "Răng sâu vỡ lớn mất quá nhiều mô men để dán dính",
      "Người có thói quen nghiến răng ban đêm nặng mà không đeo máng bảo vệ",
    ],
    advantages: [
      {
        title: "Bảo tồn mô răng thật tối đa",
        description:
          "Chỉ mài siêu mỏng từ 0.2 - 0.5mm ở mặt ngoài hoặc thậm chí không mài. Không xâm lấn mặt trong, không chạm tủy, răng thật khỏe mạnh trọn vẹn.",
        iconName: "Sparkles",
      },
      {
        title: "Thẩm mỹ trong mờ như ngọc",
        description:
          "Sứ thủy tinh cao cấp tái tạo hoàn hảo độ phản chiếu ánh sáng, vân răng 3D và độ chuyển màu tự nhiên từ cổ răng đến rìa cắn.",
        iconName: "Eye",
      },
      {
        title: "Cảm giác ăn nhai chân thực 100%",
        description:
          "Mặt trong răng thật được giữ nguyên vẹn giúp lưỡi tiếp xúc tự nhiên, không hề có cảm giác cộm cấn hay khó chịu khi phát âm và ăn uống.",
        iconName: "CheckCircle",
      },
      {
        title: "Chống bám màu & ố vàng tuyệt đối",
        description:
          "Lớp men sứ Nano bóng láng không hấp thụ màu từ cà phê, trà hay rượu vang đỏ, nụ cười luôn giữ được độ trắng sáng tinh khôi theo năm tháng.",
        iconName: "Sun",
      },
    ],
    limitations: [
      "Đòi hỏi bác sĩ thực hiện phải có tay nghề vi phẫu thẩm mỹ cực kỳ tinh xảo",
      "Chi phí cao hơn do yêu cầu kỹ thuật chế tác thủ công phối hợp máy móc tinh vi",
    ],
    specs: [
      { label: "Độ dày mặt dán", value: "0.2 mm – 0.5 mm (Siêu mỏng)" },
      { label: "Chất liệu chế tác", value: "Sứ thủy tinh Lithium Disilicate (E.max Press / Celtra Press)" },
      { label: "Hệ thống kết dính", value: "Xi măng gắn composite quang trùng hợp cao cấp (Variolink Esthetic / RelyX)" },
      { label: "Độ trong quang học", value: "Cao (Độ truyền sáng lên đến 55%)" },
      { label: "Thời hạn bảo hành", value: "7 – 10 năm (Bảo hành điện tử chính hãng)" },
      { label: "Vị trí tối ưu", value: "Nhóm răng cửa và răng tiền cối cung cười (Răng 1, 2, 3, 4)" },
    ],
    procedure: [
      {
        step: 1,
        title: "Thiết kế nụ cười Digital Smile Design (DSD)",
        duration: "Buổi 1 (45 phút)",
        description:
          "Chụp ảnh chân dung và quét nụ cười 3D, ứng dụng phần mềm DSD phân tích cung cười, tỉ lệ môi răng và mô phỏng trước kết quả nụ cười tương lai.",
      },
      {
        step: 2,
        title: "Sửa soạn men răng siêu mỏng & Lấy dấu 3D",
        duration: "Buổi 1 (45 phút)",
        description:
          "Đánh bóng và tạo nhám cực nhẹ bề mặt men răng (0.2 - 0.4mm), quét dấu hàm kỹ thuật số chuẩn xác đến từng micron gửi Labo SmileLab.",
      },
      {
        step: 3,
        title: "Ép sứ nghệ thuật & Đắp hiệu ứng tại Lab",
        duration: "2 – 3 ngày tại Lab",
        description:
          "Kỹ thuật viên chế tác mặt dán sứ bằng phương pháp ép nhiệt chân không E.max Press, vẽ vi vân và nung tráng men tạo hiệu ứng chiều sâu 3D.",
      },
      {
        step: 4,
        title: "Thử màu với gel Try-in & Dán dính vĩnh viễn",
        duration: "Buổi 2 (60 phút)",
        description:
          "Thử từng mặt dán bằng dung dịch chuyên dụng để kiểm tra màu sắc chuẩn xác nhất. Tiến hành dán dính vĩnh viễn với keo quang trùng hợp nha khoa.",
      },
      {
        step: 5,
        title: "Kiểm tra khớp cắn & Kích hoạt Thẻ Bảo Hành QR",
        duration: "Buổi 2 (15 phút)",
        description:
          "Kiểm tra khớp nhai, vệ sinh sạch keo dán thừa, kích hoạt thẻ bảo hành điện tử chính hãng trên hệ thống Portal SmileLab.",
      },
    ],
    faqs: [
      {
        question: "Dán sứ Veneer có bị rơi hay rớt mặt dán ra không?",
        answer:
          "Với công nghệ keo dán composite quang trùng hợp thế hệ mới nhất và kỹ thuật sửa soạn đúng chuẩn, mặt dán sứ sẽ liên kết bền chặt vào men răng như một phần cơ thể tự nhiên. Rất hiếm khi bị bong tróc nếu không có lực chấn thương ngoại lực mạnh.",
      },
      {
        question: "Dán sứ Veneer có đau và phải gây tê không?",
        answer:
          "Quy trình dán sứ Veneer diễn ra vô cùng nhẹ nhàng, chỉ mài chạm nhẹ lớp men nông bên ngoài nên phần lớn khách hàng thậm chí không cần gây tê và hoàn toàn không có cảm giác ê buốt sau làm.",
      },
      {
        question: "Răng bị khấp khểnh nặng có dán sứ Veneer được không?",
        answer:
          "Trường hợp răng khấp khểnh, lệch lạc nặng không nên dán Veneer ngay vì sẽ phải mài nhiều răng. Bác sĩ SmileLab sẽ khuyên bạn nên niềng răng trước để xếp đều chân răng, sau đó mới dán Veneer hoàn thiện nụ cười hoàn hảo.",
      },
      {
        question: "Mặt dán sứ Veneer dùng được bao nhiêu năm?",
        answer:
          "Nếu được thực hiện đúng chỉ định và kỹ thuật, mặt dán sứ Veneer có tuổi thọ từ 10 đến 15 năm, thậm chí lâu hơn nữa khi bạn vệ sinh răng miệng tốt và đi cạo vôi kiểm tra định kỳ.",
      },
    ],
    comparison: {
      strengthRating: 4,
      aestheticRating: 5,
      longevityRating: 4,
      prepInvasiveness: "Tối thiểu (Chỉ 0.2 - 0.5mm hoặc không mài)",
      idealFor: "Thẩm mỹ cung cười hoàn hảo cho nhóm răng trước mà không muốn mài nhỏ răng",
    },
  },
  {
    id: "implant",
    slug: "implant",
    aliases: ["implant-phuc-hinh", "rang-su-implant", "phuc-hinh-implant"],
    name: "Phục Hình Mão Sứ Trên Trụ Implant (Implant Prosthetics)",
    shortTitle: "Phục hình trên Implant",
    tagline: "Tái sinh răng mất từ chân răng đến thân răng - Ăn nhai vững chãi trọn đời",
    category: "Cấy ghép phục hình",
    heroBadge: "Tái tạo vĩnh viễn",
    warrantyYears: "10 – 20 năm",
    warrantyDurationYears: 15,
    strength: "Chịu lực sinh học tương đương hoặc vượt trội răng thật",
    priceRange: "Từ 4.000.000đ – 10.000.000đ / mão phục hình",
    estimatedTime: "2 – 3 buổi hẹn sau khi trụ tích hợp",
    matchedServiceOption: "Phục hình trên Implant",
    overview:
      "Phục hình răng sứ trên Implant là giai đoạn kết thúc quan trọng nhất trong kỹ thuật trồng răng Implant hiện đại. Sau khi trụ Implant Titanium đã tích hợp sinh học vững chắc vào xương hàm, bác sĩ sẽ gắn kết nối trụ cầu Abutment và lắp đặt mão răng sứ được cá nhân hóa riêng biệt. Nhờ hệ thống CAD/CAM kỹ thuật số tại SmileLab, mão răng được thiết kế sát khít đường viền nướu sinh lý, tái lập khả năng ăn nhai 100% như răng thật mà không cần mài bất kỳ răng lân cận nào.",
    highlightPoints: [
      "Khôi phục hoàn hảo cả chân răng nhân tạo lẫn thân răng sứ thẩm mỹ",
      "Độc lập hoàn toàn, không xâm lấn hoặc mài 2 răng thật bên cạnh",
      "Ngăn chặn triệt để tình trạng tiêu xương hàm và lão hóa cơ mặt do mất răng",
      "Chịu lực nhai 100% như răng thật tự nhiên, không lung lay hay xê dịch",
      "Bảo hành điện tử chính hãng lên đến 15-20 năm, độ bền trọn đời",
    ],
    indications: [
      "Khách hàng đã cấy ghép trụ Implant và trụ đã tích hợp xương hàm đạt tiêu chuẩn",
      "Mất 1 răng, mất nhiều răng hoặc mất toàn hàm răng cần phục hình cố định",
      "Không muốn mài các răng thật khỏe mạnh bên cạnh để làm cầu răng thông thường",
      "Người đeo hàm tháo lắp lỏng lẻo, bất tiện, muốn chuyển sang răng cố định chắc khỏe",
    ],
    contraindications: [
      "Trụ Implant chưa lành thương hoặc chỉ số tích hợp xương ISQ chưa đạt yêu cầu tải lực",
      "Viêm nướu quanh Implant cấp tính chưa được điều trị kiểm soát",
    ],
    advantages: [
      {
        title: "Bảo toàn nguyên vẹn răng bên cạnh",
        description:
          "Răng Implant đứng độc lập như một cá thể tự nhiên, hoàn toàn không cần mài nhỏ 2 răng thật hai bên như làm cầu răng sứ truyền thống.",
        iconName: "Shield",
      },
      {
        title: "Ngăn chặn tiêu xương hàm",
        description:
          "Lực nhai truyền trực tiếp qua trụ xuống xương hàm, kích thích xương phát triển tự nhiên, ngăn ngừa tụt nướu và hóp má lão hóa sớm.",
        iconName: "HeartPulse",
      },
      {
        title: "Khôi phục sức nhai 100%",
        description:
          "Bạn có thể thoải mái ăn nhai tất cả các loại thức ăn dai cứng mà không có cảm giác lỏng lẻo hay ê buốt như răng giả tháo lắp.",
        iconName: "CheckCircle",
      },
      {
        title: "Thẩm mỹ đường viền nướu hoàn hảo",
        description:
          "Mão sứ được thiết kế viền nướu loe sinh lý (Emergence Profile) bằng phần mềm CAD, giúp nướu ôm khít tự nhiên như mọc ra từ xương hàm.",
        iconName: "Sparkles",
      },
      {
        title: "Tuổi thọ sử dụng trọn đời",
        description:
          "Với chế độ chăm sóc và vệ sinh răng miệng tốt, phục hình răng sứ trên Implant có thể tồn tại bền vững trọn đời cùng bạn.",
        iconName: "Clock",
      },
    ],
    limitations: [
      "Cần thời gian chờ đợi để trụ Implant tích hợp vào xương hàm trước khi gắn mão sứ",
      "Yêu cầu trang thiết bị vô trùng nghiêm ngặt và quy trình kiểm soát khớp cắn chuyên sâu",
    ],
    specs: [
      { label: "Khớp nối phục hình (Abutment)", value: "Customized Titanium Abutment hoặc Zirconia thẩm mỹ cá nhân hóa" },
      { label: "Mão sứ phục hình", value: "Zirconia đa lớp nguyên khối hoặc Katana ML siêu cứng" },
      { label: "Phương pháp liên kết", value: "Bắt vít trực tiếp (Screw-retained) hoặc Gắn xi măng (Cement-retained)" },
      { label: "Thiết kế viền nướu", value: "Cá nhân hóa theo đường viền giải phẫu nướu thực tế" },
      { label: "Thời hạn bảo hành", value: "10 – 20 năm (Bảo hành điện tử trên hệ thống Portal)" },
      { label: "Độ bền tuổi thọ", value: "Từ 20 năm đến trọn đời nếu chăm sóc đúng cách" },
    ],
    procedure: [
      {
        step: 1,
        title: "Kiểm tra tích hợp xương & Chụp phim kiểm tra",
        duration: "Buổi 1 (30 phút)",
        description:
          "Đo chỉ số vững ổn Implant (ISQ) bằng máy đo tần số từ tính và chụp phim X-quang kiểm tra độ liên kết xương xung quanh trụ.",
      },
      {
        step: 2,
        title: "Quét dấu kỹ thuật số bằng Scan Body 3D",
        duration: "Buổi 1 (30 phút)",
        description:
          "Gắn đầu định vị Scan Body lên trụ Implant và quét dấu toàn hàm 3D bằng máy quét trong miệng, truyền dữ liệu số hóa tức thì về SmileLab.",
      },
      {
        step: 3,
        title: "Thiết kế Abutment cá nhân hóa & Tiện mão Zirconia",
        duration: "2 – 3 ngày tại Lab",
        description:
          "Kỹ thuật viên SmileLab thiết kế trụ kết nối ôm sát lợi và tiện phay mão sứ Zirconia chịu lực cao trên máy CAD/CAM hiện đại.",
      },
      {
        step: 4,
        title: "Thử răng, Xiết lực Torque chuẩn & Hoàn thiện",
        duration: "Buổi 2 (45 phút)",
        description:
          "Bác sĩ lắp mão răng vào trụ Implant, xiết ốc kết nối với lực vặn chuẩn y khoa (30-35 Ncm), kiểm tra khớp cắn cân bằng và bịt kín lỗ vít thẩm mỹ.",
      },
      {
        step: 5,
        title: "Kích hoạt bảo hành điện tử & Hẹn lịch tái khám",
        duration: "Buổi 2 (15 phút)",
        description:
          "Cấp thẻ bảo hành điện tử chính hãng có mã QR để khách hàng kiểm tra thông số trụ và mão răng bất cứ lúc nào, hướng dẫn cách dùng chỉ nha khoa chuyên dụng.",
      },
    ],
    faqs: [
      {
        question: "Phục hình răng sứ trên Implant nên chọn loại bắt vít hay gắn xi măng?",
        answer:
          "Phục hình bắt vít (Screw-retained) hiện là tiêu chuẩn vàng vì không có xi măng thừa rơi xuống nướu gây viêm quanh Implant, đồng thời bác sĩ có thể tháo ra vệ sinh bảo trì dễ dàng sau nhiều năm.",
      },
      {
        question: "Gắn mão răng sứ trên Implant có đau không?",
        answer:
          "Hoàn toàn không đau. Vì trụ Implant đã tích hợp chắc chắn và không có dây thần kinh cảm giác như tủy răng thật, bác sĩ chỉ thao tác vặn ốc và gắn mão rất êm ái, nhẹ nhàng.",
      },
      {
        question: "Sau khi gắn mão sứ Implant có ăn nhai được bình thường ngay không?",
        answer:
          "Trong 1-2 ngày đầu, bạn nên ăn đồ mềm để làm quen với khớp cắn mới. Sau đó bạn hoàn toàn có thể ăn nhai bình thường mọi món ăn yêu thích với sức nhai khỏe như răng thật.",
      },
      {
        question: "Chăm sóc và vệ sinh răng sứ trên Implant như thế nào?",
        answer:
          "Bạn chải răng 2 lần/ngày bằng bàn chải lông mềm, kết hợp dùng máy tăm nước và chỉ nha khoa chuyên dụng cho Implant để làm sạch kẽ răng và viền nướu, đồng thời tái khám định kỳ 6 tháng/lần.",
      },
    ],
    comparison: {
      strengthRating: 5,
      aestheticRating: 5,
      longevityRating: 5,
      prepInvasiveness: "Không mài răng (Bảo tồn 100% răng bên cạnh)",
      idealFor: "Mất răng đơn lẻ hoặc mất nhiều răng, muốn phục hồi độc lập trọn đời",
    },
  },
];

/**
 * Lấy danh sách tất cả dịch vụ
 */
export function getAllServices(): ServiceDetail[] {
  return DENTAL_SERVICES_DETAIL;
}

/**
 * Lấy thông tin chi tiết dịch vụ theo slug hoặc alias
 */
export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  const normalized = slug.toLowerCase().trim();
  return DENTAL_SERVICES_DETAIL.find(
    (item) =>
      item.slug === normalized ||
      item.id === normalized ||
      (item.aliases && item.aliases.includes(normalized))
  );
}

/**
 * Lấy danh sách tất cả slugs hợp lệ để SSG
 */
export function getAllServiceSlugs(): string[] {
  const slugs: string[] = [];
  DENTAL_SERVICES_DETAIL.forEach((item) => {
    slugs.push(item.slug);
    if (item.aliases) {
      slugs.push(...item.aliases);
    }
  });
  return slugs;
}
