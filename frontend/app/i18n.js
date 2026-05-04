export const locales = ['en', 'vi']
export const futureLocales = ['ko']
export const defaultLocale = 'en'

export function normalizeLocale(locale) {
  return locales.includes(locale) ? locale : defaultLocale
}

export function localizedPath(locale, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${normalizeLocale(locale)}${clean === '/' ? '' : clean}`
}

export const languageNames = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
}

export const dict = {
  en: {
    nav: { courses: 'Courses', teachers: 'Teachers', results: 'Results', blog: 'Blog', login: 'Login' },
    footer: { programs: 'Programs', resources: 'Resources', contact: 'Contact', studentResults: 'Student results', learningArticles: 'Learning articles' },
    home: {
      eyebrow: 'Piano academy for children and families',
      title: 'Better piano lessons, clearer teacher feedback, happier home practice.',
      subtitle: 'Piano Academy AI combines professional piano teaching with structured parent communication. Teachers give the real feedback; AI helps explain it clearly to parents.',
      exploreCourses: 'Explore courses', loginDashboard: 'Login dashboard',
      trust1: 'Structured lessons', trust2: 'Teacher-led feedback', trust3: 'Parent-friendly advice',
      why: 'Why parents choose us', fullCircle: 'Designed for the full learning circle: student, teacher, and parent.',
      features: [
        ['Academic piano pathway', 'Clear course levels from playful beginner lessons to recital and exam preparation.'],
        ['Teacher feedback system', 'Teachers record lesson observations, strengths, and focused practice goals.'],
        ['AI parent explanation', 'AI converts teacher feedback into simple, encouraging parent advice only once and saves it.'],
        ['Private parent portal', 'Parents log in to see their own child’s feedback, result history, and advice.'],
      ],
      coursesTitle: 'Courses for children at different learning stages.',
      coursesText: 'Each program includes teacher notes, home practice guidance, and progress visibility for parents.',
      viewCourses: 'View all courses →',
      teachersTitle: 'Professional teachers with clear communication.',
      resultsTitle: 'Progress parents can understand.',
      resultsText: 'Instead of vague lesson comments, parents see specific feedback, saved advice, and practical next steps.',
      readResults: 'Read results →',
      blogTitle: 'Piano learning articles for parents.',
      readArticle: 'Read article →',
      heroCardTitle: 'Weekly student progress',
      heroCardText: 'Canon in D · Rhythm improved · Practice plan saved',
      dailyPractice: 'daily practice', aiAdviceSaved: 'AI advice saved', teacherApproved: 'teacher approved',
    },
    pages: {
      courses: { eyebrow: 'Courses', title: 'Structured piano courses for children and families.', subtitle: 'From the first lesson to performance preparation, each course includes teacher feedback and clear home practice guidance.' },
      teachers: { eyebrow: 'Teachers', title: 'Teachers remain the expert voice. AI only helps parents understand.', subtitle: 'Our workflow protects the role of the teacher while making lesson feedback easier for families to follow at home.' },
      results: { eyebrow: 'Results and testimonials', title: 'Visible progress for students. Practical clarity for parents.', subtitle: 'Parents can follow teacher feedback, AI-assisted advice, and progress history from their private portal.' },
      blog: { eyebrow: 'Blog', title: 'Piano learning articles for parents.', subtitle: 'Simple guidance to help families support children’s piano learning at home.' },
    },
    cta: { eyebrow: 'Ready for a smarter academy workflow?', title: 'Connect lessons, teacher feedback, parent advice, and student progress.', text: 'Use the private dashboard for Admin, Teacher, and Parent roles after login.', button: 'Open dashboard' },
    article: { back: '← Back to blog', tipTitle: 'Parent practice tip:', tipText: 'Keep the practice target very small and positive. Teacher feedback should remain the main source of truth.' },
    dashboard: { login: 'Login', logout: 'Logout', title: 'Piano Academy AI', subtitle: 'Role-based academic workflow', language: 'Language' },
  },
  vi: {
    nav: { courses: 'Khóa học', teachers: 'Giáo viên', results: 'Kết quả', blog: 'Bài viết', login: 'Đăng nhập' },
    footer: { programs: 'Chương trình', resources: 'Tài nguyên', contact: 'Liên hệ', studentResults: 'Kết quả học viên', learningArticles: 'Bài viết học piano' },
    home: {
      eyebrow: 'Học viện piano cho trẻ em và gia đình',
      title: 'Bài học piano tốt hơn, phản hồi rõ hơn, luyện tập tại nhà vui hơn.',
      subtitle: 'Piano Academy AI kết hợp giảng dạy piano chuyên nghiệp với hệ thống trao đổi rõ ràng cho phụ huynh. Giáo viên đưa ra phản hồi chuyên môn; AI giúp diễn giải dễ hiểu cho phụ huynh.',
      exploreCourses: 'Xem khóa học', loginDashboard: 'Đăng nhập hệ thống',
      trust1: 'Lộ trình rõ ràng', trust2: 'Phản hồi từ giáo viên', trust3: 'Lời khuyên dễ hiểu cho phụ huynh',
      why: 'Vì sao phụ huynh chọn chúng tôi', fullCircle: 'Thiết kế cho cả vòng học tập: học viên, giáo viên và phụ huynh.',
      features: [
        ['Lộ trình piano học thuật', 'Các cấp độ rõ ràng từ làm quen vui vẻ đến biểu diễn và luyện thi.'],
        ['Hệ thống phản hồi giáo viên', 'Giáo viên ghi nhận điểm mạnh, quan sát trong buổi học và mục tiêu luyện tập.'],
        ['AI diễn giải cho phụ huynh', 'AI chuyển phản hồi của giáo viên thành lời khuyên đơn giản, tích cực và chỉ tạo một lần.'],
        ['Cổng thông tin phụ huynh', 'Phụ huynh đăng nhập để xem phản hồi, lịch sử tiến bộ và lời khuyên của con mình.'],
      ],
      coursesTitle: 'Khóa học cho từng giai đoạn phát triển của trẻ.',
      coursesText: 'Mỗi chương trình gồm ghi chú của giáo viên, hướng dẫn luyện tập tại nhà và theo dõi tiến bộ.',
      viewCourses: 'Xem tất cả khóa học →',
      teachersTitle: 'Giáo viên chuyên nghiệp, trao đổi rõ ràng.',
      resultsTitle: 'Tiến bộ mà phụ huynh có thể hiểu.',
      resultsText: 'Thay vì nhận xét chung chung, phụ huynh thấy phản hồi cụ thể, lời khuyên đã lưu và bước tiếp theo thực tế.',
      readResults: 'Xem kết quả →',
      blogTitle: 'Bài viết học piano dành cho phụ huynh.',
      readArticle: 'Đọc bài viết →',
      heroCardTitle: 'Tiến bộ hằng tuần của học viên',
      heroCardText: 'Canon in D · Nhịp tốt hơn · Kế hoạch luyện tập đã lưu',
      dailyPractice: 'luyện tập mỗi ngày', aiAdviceSaved: 'lời khuyên AI đã lưu', teacherApproved: 'giáo viên xác nhận',
    },
    pages: {
      courses: { eyebrow: 'Khóa học', title: 'Khóa học piano có cấu trúc cho trẻ em và gia đình.', subtitle: 'Từ buổi học đầu tiên đến chuẩn bị biểu diễn, mỗi khóa học đều có phản hồi giáo viên và hướng dẫn luyện tập tại nhà rõ ràng.' },
      teachers: { eyebrow: 'Giáo viên', title: 'Giáo viên vẫn là tiếng nói chuyên môn. AI chỉ giúp phụ huynh hiểu rõ hơn.', subtitle: 'Quy trình bảo vệ vai trò của giáo viên đồng thời giúp gia đình dễ theo dõi phản hồi sau mỗi buổi học.' },
      results: { eyebrow: 'Kết quả và cảm nhận', title: 'Tiến bộ rõ ràng cho học viên. Định hướng thực tế cho phụ huynh.', subtitle: 'Phụ huynh có thể theo dõi phản hồi của giáo viên, lời khuyên AI và lịch sử tiến bộ từ cổng riêng.' },
      blog: { eyebrow: 'Bài viết', title: 'Bài viết học piano dành cho phụ huynh.', subtitle: 'Hướng dẫn đơn giản để gia đình hỗ trợ trẻ học piano tại nhà.' },
    },
    cta: { eyebrow: 'Sẵn sàng cho quy trình học viện thông minh hơn?', title: 'Kết nối bài học, phản hồi giáo viên, lời khuyên phụ huynh và tiến bộ học viên.', text: 'Sử dụng dashboard riêng cho Admin, Giáo viên và Phụ huynh sau khi đăng nhập.', button: 'Mở dashboard' },
    article: { back: '← Quay lại bài viết', tipTitle: 'Gợi ý luyện tập cho phụ huynh:', tipText: 'Giữ mục tiêu luyện tập thật nhỏ và tích cực. Phản hồi của giáo viên vẫn là nguồn định hướng chính.' },
    dashboard: { login: 'Đăng nhập', logout: 'Đăng xuất', title: 'Piano Academy AI', subtitle: 'Quy trình học viện theo vai trò', language: 'Ngôn ngữ' },
  },
}

export function getDictionary(locale) {
  return dict[normalizeLocale(locale)]
}
