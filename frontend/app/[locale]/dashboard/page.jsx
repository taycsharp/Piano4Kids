'use client'

import React, { useEffect, useState } from 'react'
import { api, API_URL, TOKEN_KEY, uploadCmsImage } from '../../lib/api'
import { SectionHeader, StatCard } from '../../components/dashboard/common'
import { useParams, useRouter } from 'next/navigation'
import { getDictionary, languageNames, locales, normalizeLocale } from '../../i18n'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import LogoutIcon from '@mui/icons-material/Logout'
import PianoIcon from '@mui/icons-material/Piano'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SchoolIcon from '@mui/icons-material/School'
import DeleteIcon from '@mui/icons-material/Delete'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1557b0' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f3f6fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 18 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 800, borderRadius: 14 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(21,87,176,0.08)', boxShadow: '0 16px 40px rgba(31,44,71,0.08)' } } },
  },
})


const dashboardTexts = {
  en: {
    loginIntro: 'Login as Admin, Teacher, or Parent. Teachers create feedback and generate AI parent advice once. Parents see only their child’s saved results.',
    seoTitle: 'Modern piano education platform',
    seoText: 'Piano Academy AI helps music schools manage teacher feedback, student progress, parent communication, and AI-assisted practice advice. Public content uses Next.js for SEO while dashboards are protected with JWT.',
    signingIn: 'Signing in...', email: 'Email', password: 'Password', demoAccounts: 'Demo accounts',
    roles: { admin: 'Admin', teacher: 'Teacher', parent: 'Parent' },
    ollamaReady: 'Ollama ready', ollamaNotReady: 'Ollama not ready',
    heroTitle: 'Professional piano academy workflow',
    heroSubtitle: 'Secure login, teacher feedback, one-time AI advice, and a private progress page for parents.',
    teachers: 'teachers', students: 'students', records: 'records', aiSaved: 'AI saved',
    publicCms: 'Public website CMS', publicCmsSub: 'Admin can manage courses, public teacher profiles, testimonials, and blog articles.',
    tabs: { homepage: 'Homepage hero', courses: 'Courses', publicTeachers: 'Public teachers', testimonials: 'Testimonials', posts: 'Blog posts' },
    language: 'Language', english: 'English', vietnamese: 'Tiếng Việt', koreanReady: 'Korean / 한국어 - ready later',
    sortOrder: 'Sort order', imageUrl: 'Image URL', imageAlt: 'Image alt text', uploadImage: 'Upload image', chooseExistingImage: 'Choose existing photo first', mediaLibrary: 'Photo library', usePhoto: 'Use photo', duplicateImageReused: 'This photo already exists. The app reused the existing photo instead of uploading a duplicate.', removeImage: 'Remove image', imageSaved: 'Image uploaded and attached to this form.', deletePhoto: 'Delete photo', confirmDeletePhoto: 'Delete this photo from the library?', photoDeleted: 'Photo deleted from the library.', photoInUseWarning: 'Cannot delete this photo because it is used in homepage, teacher, course, result, or blog content. Remove references first or ask an admin to force delete.', published: 'Published', hidden: 'Hidden', publishedQ: 'Published',
    editCourse: 'Edit course', createCourse: 'Create course', courseTitle: 'Course title', age: 'Age', level: 'Level', description: 'Description', outcomes: 'Outcomes, one per line', saveCourse: 'Save course', clear: 'Clear',
    editPublicTeacher: 'Edit public teacher', createPublicTeacher: 'Create public teacher', name: 'Name', publicRole: 'Public role', initials: 'Initials', bio: 'Bio', saveTeacherProfile: 'Save teacher profile',
    editTestimonial: 'Edit testimonial', createTestimonial: 'Create testimonial', studentLabel: 'Student label', result: 'Result', parentQuote: 'Parent quote', saveTestimonial: 'Save testimonial',
    editHomepage: 'Edit homepage hero', createHomepage: 'Create homepage hero', eyebrow: 'Eyebrow text', heroTitleField: 'Hero title', heroSubtitleField: 'Hero subtitle', primaryButtonText: 'Primary button text', primaryButtonHref: 'Primary button link', secondaryButtonText: 'Secondary button text', secondaryButtonHref: 'Secondary button link', cardTitle: 'Hero card title', cardText: 'Hero card text', stat1Value: 'Stat 1 value', stat1Label: 'Stat 1 label', stat2Value: 'Stat 2 value', stat2Label: 'Stat 2 label', stat3Value: 'Stat 3 value', stat3Label: 'Stat 3 label', saveHomepage: 'Save homepage hero', editBlogPost: 'Edit blog post', createBlogPost: 'Create blog post', slug: 'Slug', slugHelp: 'Example: how-to-practice-piano', title: 'Title', excerpt: 'Excerpt', readTime: 'Read time', content: 'Content, separate paragraphs with blank lines', saveBlogPost: 'Save blog post',
    edit: 'Edit', delete: 'Delete', cmsSaved: 'Public content saved. Refresh the public page to see updates.', cmsDeleted: 'Public content deleted.',
    adminStats: { teachers: 'Teachers', students: 'Students', feedbackRecords: 'Feedback records', aiAdviceSaved: 'AI advice saved' },
    createTeacher: 'Create teacher', createTeacherSub: 'Admin creates teacher login accounts.', teacherName: 'Teacher name', teacherEmail: 'Teacher email', specialty: 'Specialty', initialPassword: 'Initial password', createTeacherAccount: 'Create teacher account', teacherCreated: 'Teacher account created', defaultPassword: 'Default password',
    overview: 'Academy overview', overviewSub: 'All teachers, students, and saved advice records.', noSpecialty: 'No specialty',
    myStudents: 'My students', waitingAI: 'Waiting AI', createStudent: 'Create student', createStudentSub: 'A parent account is created when parent email is provided.', studentName: 'Student name', parentName: 'Parent name', parentEmail: 'Parent email for login', parentInitialPassword: 'Parent initial password', studentCreated: 'Student created', parentLoginIs: 'Parent login is', notSetYet: 'not set yet',
    createLessonFeedback: 'Create lesson feedback', createLessonFeedbackSub: 'AI advice can be generated only one time per feedback record.', student: 'Student', pieceTitle: 'Piece title', teacherFeedback: 'Teacher feedback', saveFeedback: 'Save feedback', feedbackSaved: 'Feedback saved', generateReady: 'Generate AI advice when ready.',
    feedbackAdviceRecords: 'Feedback and advice records', feedbackAdviceRecordsSub: 'Parents see generated advice only after it is saved.', created: 'Created', aiAdviceSavedChip: 'AI advice saved', waitingForAI: 'Waiting for AI', parentAdvice: 'Parent advice', aiGeneratedSaved: 'AI parent advice generated one time and saved to database.', aiAlreadyGenerated: 'AI already generated', generateAIOnce: 'Generate AI advice once',
    myChildren: 'My children', parentTeacherFeedback: 'Teacher feedback', ageLabel: 'Age', aiAdviceSavedStat: 'AI advice saved', myChild: 'My child', myChildSub: 'Information connected to this parent login.', teacher: 'Teacher', savedResultsAdvice: 'Saved results and advice', savedResultsAdviceSub: 'You can see only advice generated and saved by the teacher.', noAdviceYet: 'No AI advice is available yet. Please wait for the teacher to generate and save advice.', savedAdvice: 'Saved advice', aiAdviceForParent: 'AI advice for parent',
    dashboardLabel: 'DASHBOARD'
  },
  vi: {
    loginIntro: 'Đăng nhập với vai trò Admin, Giáo viên hoặc Phụ huynh. Giáo viên tạo phản hồi và tạo lời khuyên AI một lần. Phụ huynh chỉ xem kết quả đã lưu của con mình.',
    seoTitle: 'Nền tảng giáo dục piano hiện đại',
    seoText: 'Piano Academy AI giúp trung tâm âm nhạc quản lý phản hồi giáo viên, tiến bộ học viên, trao đổi với phụ huynh và lời khuyên luyện tập từ AI. Nội dung công khai dùng Next.js để hỗ trợ SEO, còn dashboard được bảo vệ bằng JWT.',
    signingIn: 'Đang đăng nhập...', email: 'Email', password: 'Mật khẩu', demoAccounts: 'Tài khoản demo',
    roles: { admin: 'Admin', teacher: 'Giáo viên', parent: 'Phụ huynh' },
    ollamaReady: 'Ollama sẵn sàng', ollamaNotReady: 'Ollama chưa sẵn sàng',
    heroTitle: 'Quy trình học viện piano chuyên nghiệp',
    heroSubtitle: 'Đăng nhập bảo mật, phản hồi giáo viên, lời khuyên AI một lần và trang tiến bộ riêng cho phụ huynh.',
    teachers: 'giáo viên', students: 'học viên', records: 'bản ghi', aiSaved: 'AI đã lưu',
    publicCms: 'CMS trang công khai', publicCmsSub: 'Admin có thể quản lý khóa học, hồ sơ giáo viên công khai, cảm nhận phụ huynh và bài viết.',
    tabs: { homepage: 'Hero trang chủ', courses: 'Khóa học', publicTeachers: 'Giáo viên công khai', testimonials: 'Cảm nhận', posts: 'Bài viết' },
    language: 'Ngôn ngữ', english: 'English', vietnamese: 'Tiếng Việt', koreanReady: 'Korean / 한국어 - chuẩn bị sau',
    sortOrder: 'Thứ tự hiển thị', imageUrl: 'Đường dẫn ảnh', imageAlt: 'Mô tả ảnh', uploadImage: 'Tải ảnh lên', chooseExistingImage: 'Chọn ảnh có sẵn trước', mediaLibrary: 'Thư viện ảnh', usePhoto: 'Dùng ảnh này', duplicateImageReused: 'Ảnh này đã có trong thư viện. Hệ thống dùng lại ảnh cũ thay vì tải trùng.', removeImage: 'Xóa ảnh', imageSaved: 'Ảnh đã được tải lên và gắn vào form này.', deletePhoto: 'Xóa ảnh', confirmDeletePhoto: 'Xóa ảnh này khỏi thư viện?', photoDeleted: 'Ảnh đã được xóa khỏi thư viện.', photoInUseWarning: 'Không thể xóa ảnh vì đang được dùng trong nội dung trang chủ, giáo viên, khóa học, kết quả hoặc blog. Hãy gỡ tham chiếu trước hoặc nhờ admin xóa cưỡng bức.', published: 'Đã xuất bản', hidden: 'Ẩn', publishedQ: 'Trạng thái',
    editCourse: 'Sửa khóa học', createCourse: 'Tạo khóa học', courseTitle: 'Tên khóa học', age: 'Độ tuổi', level: 'Cấp độ', description: 'Mô tả', outcomes: 'Kết quả đạt được, mỗi dòng một ý', saveCourse: 'Lưu khóa học', clear: 'Xóa form',
    editPublicTeacher: 'Sửa hồ sơ giáo viên', createPublicTeacher: 'Tạo hồ sơ giáo viên', name: 'Tên', publicRole: 'Vai trò công khai', initials: 'Chữ viết tắt', bio: 'Giới thiệu', saveTeacherProfile: 'Lưu hồ sơ giáo viên',
    editTestimonial: 'Sửa cảm nhận', createTestimonial: 'Tạo cảm nhận', studentLabel: 'Thông tin học viên', result: 'Kết quả', parentQuote: 'Chia sẻ phụ huynh', saveTestimonial: 'Lưu cảm nhận',
    editHomepage: 'Sửa hero trang chủ', createHomepage: 'Tạo hero trang chủ', eyebrow: 'Dòng giới thiệu nhỏ', heroTitleField: 'Tiêu đề hero', heroSubtitleField: 'Mô tả hero', primaryButtonText: 'Nút chính', primaryButtonHref: 'Link nút chính', secondaryButtonText: 'Nút phụ', secondaryButtonHref: 'Link nút phụ', cardTitle: 'Tiêu đề thẻ hero', cardText: 'Nội dung thẻ hero', stat1Value: 'Chỉ số 1', stat1Label: 'Nhãn chỉ số 1', stat2Value: 'Chỉ số 2', stat2Label: 'Nhãn chỉ số 2', stat3Value: 'Chỉ số 3', stat3Label: 'Nhãn chỉ số 3', saveHomepage: 'Lưu hero trang chủ', editBlogPost: 'Sửa bài viết', createBlogPost: 'Tạo bài viết', slug: 'Đường dẫn slug', slugHelp: 'Ví dụ: cach-luyen-tap-piano', title: 'Tiêu đề', excerpt: 'Tóm tắt', readTime: 'Thời gian đọc', content: 'Nội dung, cách đoạn bằng dòng trống', saveBlogPost: 'Lưu bài viết',
    edit: 'Sửa', delete: 'Xóa', cmsSaved: 'Nội dung công khai đã được lưu. Tải lại trang công khai để xem cập nhật.', cmsDeleted: 'Nội dung công khai đã được xóa.',
    adminStats: { teachers: 'Giáo viên', students: 'Học viên', feedbackRecords: 'Bản ghi phản hồi', aiAdviceSaved: 'Lời khuyên AI đã lưu' },
    createTeacher: 'Tạo giáo viên', createTeacherSub: 'Admin tạo tài khoản đăng nhập cho giáo viên.', teacherName: 'Tên giáo viên', teacherEmail: 'Email giáo viên', specialty: 'Chuyên môn', initialPassword: 'Mật khẩu ban đầu', createTeacherAccount: 'Tạo tài khoản giáo viên', teacherCreated: 'Đã tạo tài khoản giáo viên', defaultPassword: 'Mật khẩu mặc định',
    overview: 'Tổng quan học viện', overviewSub: 'Tất cả giáo viên, học viên và bản ghi lời khuyên đã lưu.', noSpecialty: 'Chưa có chuyên môn',
    myStudents: 'Học viên của tôi', waitingAI: 'Chờ AI', createStudent: 'Tạo học viên', createStudentSub: 'Tài khoản phụ huynh sẽ được tạo khi có email phụ huynh.', studentName: 'Tên học viên', parentName: 'Tên phụ huynh', parentEmail: 'Email phụ huynh để đăng nhập', parentInitialPassword: 'Mật khẩu ban đầu của phụ huynh', studentCreated: 'Đã tạo học viên', parentLoginIs: 'Tài khoản phụ huynh là', notSetYet: 'chưa thiết lập',
    createLessonFeedback: 'Tạo phản hồi buổi học', createLessonFeedbackSub: 'Lời khuyên AI chỉ được tạo một lần cho mỗi bản ghi phản hồi.', student: 'Học viên', pieceTitle: 'Tên bài nhạc', teacherFeedback: 'Phản hồi của giáo viên', saveFeedback: 'Lưu phản hồi', feedbackSaved: 'Đã lưu phản hồi', generateReady: 'Có thể tạo lời khuyên AI khi sẵn sàng.',
    feedbackAdviceRecords: 'Bản ghi phản hồi và lời khuyên', feedbackAdviceRecordsSub: 'Phụ huynh chỉ thấy lời khuyên đã được giáo viên tạo và lưu.', created: 'Đã tạo', aiAdviceSavedChip: 'Đã lưu lời khuyên AI', waitingForAI: 'Đang chờ AI', parentAdvice: 'Lời khuyên cho phụ huynh', aiGeneratedSaved: 'Lời khuyên AI cho phụ huynh đã được tạo một lần và lưu vào cơ sở dữ liệu.', aiAlreadyGenerated: 'AI đã được tạo', generateAIOnce: 'Tạo lời khuyên AI một lần',
    myChildren: 'Con của tôi', parentTeacherFeedback: 'Phản hồi giáo viên', ageLabel: 'Tuổi', aiAdviceSavedStat: 'Lời khuyên AI đã lưu', myChild: 'Con của tôi', myChildSub: 'Thông tin được liên kết với tài khoản phụ huynh này.', teacher: 'Giáo viên', savedResultsAdvice: 'Kết quả và lời khuyên đã lưu', savedResultsAdviceSub: 'Bạn chỉ có thể xem lời khuyên đã được giáo viên tạo và lưu.', noAdviceYet: 'Chưa có lời khuyên AI. Vui lòng chờ giáo viên tạo và lưu lời khuyên.', savedAdvice: 'Lời khuyên đã lưu', aiAdviceForParent: 'Lời khuyên AI cho phụ huynh',
    dashboardLabel: 'DASHBOARD'
  },
}

function getDashboardText(locale) {
  return dashboardTexts[locale] || dashboardTexts.en
}

function LoginPage({ onLogin, locale }) {
  const t = getDictionary(locale)
  const d = getDashboardText(locale)
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) })
      localStorage.setItem(TOKEN_KEY, data.access_token)
      onLogin(data.user)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    [d.roles.admin, 'admin@example.com', 'admin123'],
    [d.roles.teacher, 'teacher@example.com', 'teacher123'],
    [d.roles.parent, 'parent@example.com', 'parent123'],
  ]

  return (
    <Box className="loginShell">
      <Card className="loginCard">
        <CardContent sx={{ p: 5 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar className="brandAvatar"><PianoIcon /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight={900}>Piano Academy AI</Typography>
                <Typography color="text.secondary">{t.dashboard.subtitle}</Typography>
              </Box>
            </Stack>
            <Typography color="text.secondary">{d.loginIntro}</Typography>
            <Box className="publicSeoPanel">
              <Typography variant="h6" fontWeight={900}>{d.seoTitle}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {d.seoText}
              </Typography>
            </Box>
            {message && <Alert severity={message.type}>{message.text}</Alert>}
            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                <TextField label={d.email} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <TextField label={d.password} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? d.signingIn : t.dashboard.login}</Button>
              </Stack>
            </Box>
            <Divider />
            <Typography variant="subtitle2" fontWeight={900}>{d.demoAccounts}</Typography>
            <Grid container spacing={1.5}>
              {demoAccounts.map(([role, email, password]) => (
                <Grid item xs={12} md={4} key={role}>
                  <Paper className="demoAccount" onClick={() => setForm({ email, password })}>
                    <Typography fontWeight={900}>{role}</Typography>
                    <Typography variant="caption" color="text.secondary">{email}</Typography>
                    <Typography variant="caption" display="block">{d.password}: {password}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function AppShell({ user, aiStatus, dashboard, onLogout, children, locale }) {
  const router = useRouter()
  const t = getDictionary(locale)
  const d = getDashboardText(locale)
  return (
    <>
      <AppBar position="sticky" elevation={0} className="topBar">
        <Toolbar>
          <PianoIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={900} sx={{ flexGrow: 1 }}>Piano Academy AI</Typography>
          <Chip sx={{ mr: 1 }} label={`${user.name} · ${d.roles[user.role] || user.role}`} color="primary" variant="outlined" />
          <Chip
            color={aiStatus?.ok && aiStatus?.model_available ? 'success' : 'warning'}
            label={aiStatus?.ok && aiStatus?.model_available ? `${d.ollamaReady}: ${aiStatus.configured_model}` : d.ollamaNotReady}
          />
          <Select size="small" value={locale} onChange={(e) => router.push(`/${e.target.value}/dashboard`)} sx={{ ml: 2, minWidth: 120, color: "white", borderColor: "rgba(255,255,255,0.4)", ".MuiSvgIcon-root": { color: "white" }, ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" } }}>
            {locales.map((item) => <MenuItem key={item} value={item}>{languageNames[item]}</MenuItem>)}
          </Select>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ ml: 2 }}>{t.dashboard.logout}</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper className="hero" elevation={0}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography variant="h3" fontWeight={900}>{d.heroTitle}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                {d.heroSubtitle}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label={`${dashboard?.teachers ?? 0} ${d.teachers}`} />
              <Chip label={`${dashboard?.students ?? 0} ${d.students}`} />
              <Chip label={`${dashboard?.advice_records ?? 0} ${d.records}`} />
              <Chip color="success" label={`${dashboard?.generated_advice ?? 0} ${d.aiSaved}`} />
            </Stack>
          </Stack>
        </Paper>
        {children}
      </Container>
    </>
  )
}


function PublicContentAdmin({ setMessage, locale }) {
  const d = getDashboardText(locale)
  const defaultContentLocale = locale === 'vi' ? 'vi' : 'en'
  const emptyHero = {
    locale: defaultContentLocale,
    eyebrow: defaultContentLocale === 'vi' ? 'HỌC VIỆN PIANO CHO TRẺ EM VÀ GIA ĐÌNH' : 'PIANO ACADEMY FOR CHILDREN AND FAMILIES',
    title: defaultContentLocale === 'vi' ? 'Bài học piano tốt hơn, phản hồi rõ hơn, luyện tập tại nhà vui hơn.' : 'Better piano lessons, clearer feedback, happier home practice.',
    subtitle: defaultContentLocale === 'vi' ? 'Piano Academy AI kết hợp giảng dạy piano chuyên nghiệp với hệ thống trao đổi rõ ràng cho phụ huynh.' : 'Piano Academy AI combines professional piano teaching with clear parent communication.',
    primary_button_text: defaultContentLocale === 'vi' ? 'Xem khóa học' : 'Explore courses',
    primary_button_href: '/courses',
    secondary_button_text: defaultContentLocale === 'vi' ? 'Đăng nhập hệ thống' : 'Login dashboard',
    secondary_button_href: '/dashboard',
    image_url: '', image_alt: '',
    card_title: defaultContentLocale === 'vi' ? 'Tiến độ hằng tuần của học viên' : 'Weekly student progress',
    card_text: defaultContentLocale === 'vi' ? 'Canon in D · Nhịp tốt hơn · Kế hoạch luyện tập đã lưu' : 'Canon in D · Rhythm improved · Practice plan saved',
    stat_1_value: '10 min', stat_1_label: defaultContentLocale === 'vi' ? 'luyện tập mỗi ngày' : 'daily practice',
    stat_2_value: '1x', stat_2_label: defaultContentLocale === 'vi' ? 'lời khuyên AI đã lưu' : 'AI advice saved',
    stat_3_value: '100%', stat_3_label: defaultContentLocale === 'vi' ? 'giáo viên xác nhận' : 'teacher confirmed',
    is_published: true,
  }
  const emptyCourse = { locale: defaultContentLocale, title: '', age: 'Ages 4–6', level: 'Beginner', description: '', outcomes: '', image_url: '', image_alt: '', is_published: true, sort_order: 10 }
  const emptyTeacher = { locale: defaultContentLocale, name: '', role: 'Piano Teacher', bio: '', initials: '', image_url: '', image_alt: '', is_published: true, sort_order: 10 }
  const emptyTestimonial = { locale: defaultContentLocale, student: '', result: '', parent_quote: '', image_url: '', image_alt: '', is_published: true, sort_order: 10 }
  const emptyPost = { locale: defaultContentLocale, slug: '', title: '', excerpt: '', content: '', read_time: '5 min read', image_url: '', image_alt: '', is_published: true, sort_order: 10 }

  const [cmsTab, setCmsTab] = useState('homepage')
  const [heroes, setHeroes] = useState([])
  const [courses, setCourses] = useState([])
  const [publicTeachers, setPublicTeachers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [posts, setPosts] = useState([])
  const [mediaAssets, setMediaAssets] = useState([])
  const [heroForm, setHeroForm] = useState(emptyHero)
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [teacherForm, setTeacherForm] = useState(emptyTeacher)
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial)
  const [postForm, setPostForm] = useState(emptyPost)
  const [editing, setEditing] = useState({ type: null, id: null })

  async function loadCms() {
    const [h, c, t, r, b, m] = await Promise.all([
      api('/cms/homepage-heroes'),
      api('/cms/courses'),
      api('/cms/public-teachers'),
      api('/cms/testimonials'),
      api('/cms/blog-posts'),
      api('/cms/media-library'),
    ])
    setHeroes(h); setCourses(c); setPublicTeachers(t); setTestimonials(r); setPosts(b); setMediaAssets(m.assets || [])
  }
  useEffect(() => { loadCms().catch((e) => setMessage({ type: 'error', text: e.message })) }, [])

  function resetForms() {
    setHeroForm(emptyHero); setCourseForm(emptyCourse); setTeacherForm(emptyTeacher); setTestimonialForm(emptyTestimonial); setPostForm(emptyPost); setEditing({ type: null, id: null })
  }

  async function saveItem(type, form) {
    const map = {
      homepage: '/cms/homepage-heroes',
      courses: '/cms/courses',
      teachers: '/cms/public-teachers',
      testimonials: '/cms/testimonials',
      posts: '/cms/blog-posts',
    }
    const cleaned = { ...form }
    if ('sort_order' in cleaned) cleaned.sort_order = Number(cleaned.sort_order || 0)
    const path = editing.type === type && editing.id ? `${map[type]}/${editing.id}` : map[type]
    const method = editing.type === type && editing.id ? 'PUT' : 'POST'
    try {
      await api(path, { method, body: JSON.stringify(cleaned) })
      setMessage({ type: 'success', text: d.cmsSaved })
      resetForms(); await loadCms()
    } catch (err) {
      if ((err?.message || '').toLowerCase().includes('currently used by cms content')) {
        setMessage({ type: 'error', text: d.photoInUseWarning })
      } else {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  async function deleteItem(type, id) {
    const map = { homepage: '/cms/homepage-heroes', courses: '/cms/courses', teachers: '/cms/public-teachers', testimonials: '/cms/testimonials', posts: '/cms/blog-posts' }
    try {
      await api(`${map[type]}/${id}`, { method: 'DELETE' })
      setMessage({ type: 'success', text: d.cmsDeleted })
      await loadCms()
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }

  async function uploadImage(file, setForm) {
    if (!file) return
    const token = localStorage.getItem(TOKEN_KEY)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`${API_URL}/cms/uploads`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(extractError(data, `Upload failed: ${response.status}`))
      setForm((prev) => ({ ...prev, image_url: data.url }))
      setMessage({ type: 'success', text: data.duplicate ? d.duplicateImageReused : (data.message || d.imageSaved) })
      const library = await api('/cms/media-library')
      setMediaAssets(library.assets || [])
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }


  async function deleteLibraryPhoto(asset, form, setForm) {
    if (!asset?.url) return
    if (!window.confirm(d.confirmDeletePhoto)) return
    try {
      await api(`/cms/media-library?url=${encodeURIComponent(asset.url)}`, { method: 'DELETE' })
      if (form.image_url === asset.url) setForm((prev) => ({ ...prev, image_url: '', image_alt: '' }))
      setMessage({ type: 'success', text: d.photoDeleted })
      const library = await api('/cms/media-library')
      setMediaAssets(library.assets || [])
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }

  function localeField(form, setForm) {
    return (
      <FormControl fullWidth>
        <InputLabel>{d.language}</InputLabel>
        <Select label={d.language} value={form.locale || 'en'} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
          <MenuItem value="en">{d.english}</MenuItem>
          <MenuItem value="vi">{d.vietnamese}</MenuItem>
          <MenuItem value="ko" disabled>{d.koreanReady}</MenuItem>
        </Select>
      </FormControl>
    )
  }

  function publishField(form, setForm) {
    return (
      <Stack direction="row" spacing={2}>
        {'sort_order' in form && <TextField type="number" label={d.sortOrder} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />}
        <FormControl fullWidth>
          <InputLabel>{d.publishedQ}</InputLabel>
          <Select label={d.publishedQ} value={form.is_published ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, is_published: e.target.value === 'yes' })}>
            <MenuItem value="yes">{d.published}</MenuItem>
            <MenuItem value="no">{d.hidden}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    )
  }

  function resolveImageSrc(url) {
    return url && url.startsWith('/media') ? `${API_URL}${url}` : url
  }

  function imageField(form, setForm) {
    const previewSrc = resolveImageSrc(form.image_url)
    return (
      <Stack spacing={1.5}>
        {previewSrc && <img className="cmsPreviewImage" src={previewSrc} alt={form.image_alt || 'CMS preview'} />}
        <Typography variant="subtitle2" fontWeight={900}>{d.chooseExistingImage}</Typography>
        <Box className="mediaLibraryGrid">
          {mediaAssets.map((asset) => (
            <Paper key={asset.url} className={`mediaLibraryItem ${form.image_url === asset.url ? 'selected' : ''}`} onClick={() => setForm({ ...form, image_url: asset.url })}>
              <Box className="mediaThumbWrap">
                <img src={resolveImageSrc(asset.url)} alt={asset.filename} />
                <Button
                  className="mediaDeleteButton"
                  color="error"
                  size="small"
                  variant="contained"
                  title={d.deletePhoto}
                  onClick={(e) => { e.stopPropagation(); deleteLibraryPhoto(asset, form, setForm) }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Typography variant="caption" noWrap title={asset.filename}>{asset.filename}</Typography>
                <Chip size="small" label={asset.library} />
              </Stack>
            </Paper>
          ))}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button component="label" variant="outlined">{d.uploadImage}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadImage(e.target.files?.[0], setForm)} /></Button>
          {form.image_url && <Button color="error" onClick={() => setForm({ ...form, image_url: '', image_alt: '' })}>{d.removeImage}</Button>}
        </Stack>
        <TextField label={d.imageUrl} value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} helperText="Choose from library, upload only if new, or paste an external URL" />
        <TextField label={d.imageAlt} value={form.image_alt || ''} onChange={(e) => setForm({ ...form, image_alt: e.target.value })} />
      </Stack>
    )
  }

  const currentList = cmsTab === 'homepage' ? heroes : cmsTab === 'courses' ? courses : cmsTab === 'teachers' ? publicTeachers : cmsTab === 'testimonials' ? testimonials : posts
  const formTitleMap = {
    homepage: editing.type === 'homepage' ? d.editHomepage : d.createHomepage,
    courses: editing.type === 'courses' ? d.editCourse : d.createCourse,
    teachers: editing.type === 'teachers' ? d.editPublicTeacher : d.createPublicTeacher,
    testimonials: editing.type === 'testimonials' ? d.editTestimonial : d.createTestimonial,
    posts: editing.type === 'posts' ? d.editBlogPost : d.createBlogPost,
  }

  return (
    <Card className="cmsAdminCard" sx={{ mt: 3 }}><CardContent>
      <SectionHeader icon={<AdminPanelSettingsIcon />} title={d.publicCms} subtitle={d.publicCmsSub} />
      <Tabs value={cmsTab} onChange={(_, v) => { setCmsTab(v); resetForms() }} sx={{ mb: 3 }} variant="scrollable">
        <Tab value="homepage" label={d.tabs.homepage} />
        <Tab value="courses" label={d.tabs.courses} />
        <Tab value="teachers" label={d.tabs.publicTeachers} />
        <Tab value="testimonials" label={d.tabs.testimonials} />
        <Tab value="posts" label={d.tabs.posts} />
      </Tabs>

      {cmsTab === 'homepage' && <Grid container spacing={3} className="cmsContentGrid">
        <Grid item xs={12} lg={6}><Box className="cmsFormPanel" component="form" onSubmit={(e) => { e.preventDefault(); saveItem('homepage', heroForm) }}><Stack spacing={2.25}>
          <Typography variant="h6" fontWeight={900}>Content editor</Typography>
          <Typography color="text.secondary">{formTitleMap.homepage}</Typography>
          {localeField(heroForm, setHeroForm)}
          <TextField label={d.eyebrow} value={heroForm.eyebrow || ''} onChange={(e) => setHeroForm({ ...heroForm, eyebrow: e.target.value })} />
          <TextField required label={d.heroTitleField} value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} />
          <TextField required multiline minRows={3} label={d.heroSubtitleField} value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} />
          <Stack direction="row" spacing={2}><TextField label={d.primaryButtonText} value={heroForm.primary_button_text || ''} onChange={(e) => setHeroForm({ ...heroForm, primary_button_text: e.target.value })} /><TextField label={d.primaryButtonHref} value={heroForm.primary_button_href || ''} onChange={(e) => setHeroForm({ ...heroForm, primary_button_href: e.target.value })} /></Stack>
          <Stack direction="row" spacing={2}><TextField label={d.secondaryButtonText} value={heroForm.secondary_button_text || ''} onChange={(e) => setHeroForm({ ...heroForm, secondary_button_text: e.target.value })} /><TextField label={d.secondaryButtonHref} value={heroForm.secondary_button_href || ''} onChange={(e) => setHeroForm({ ...heroForm, secondary_button_href: e.target.value })} /></Stack>
          {imageField(heroForm, setHeroForm)}
          <TextField label={d.cardTitle} value={heroForm.card_title || ''} onChange={(e) => setHeroForm({ ...heroForm, card_title: e.target.value })} />
          <TextField multiline minRows={2} label={d.cardText} value={heroForm.card_text || ''} onChange={(e) => setHeroForm({ ...heroForm, card_text: e.target.value })} />
          <Stack direction="row" spacing={2}><TextField label={d.stat1Value} value={heroForm.stat_1_value || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_1_value: e.target.value })} /><TextField label={d.stat1Label} value={heroForm.stat_1_label || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_1_label: e.target.value })} /></Stack>
          <Stack direction="row" spacing={2}><TextField label={d.stat2Value} value={heroForm.stat_2_value || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_2_value: e.target.value })} /><TextField label={d.stat2Label} value={heroForm.stat_2_label || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_2_label: e.target.value })} /></Stack>
          <Stack direction="row" spacing={2}><TextField label={d.stat3Value} value={heroForm.stat_3_value || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_3_value: e.target.value })} /><TextField label={d.stat3Label} value={heroForm.stat_3_label || ''} onChange={(e) => setHeroForm({ ...heroForm, stat_3_label: e.target.value })} /></Stack>
          {publishField(heroForm, setHeroForm)}
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained">{d.saveHomepage}</Button><Button onClick={resetForms}>{d.clear}</Button></Stack>
        </Stack></Box></Grid>
        <Grid item xs={12} lg={6}>{renderCmsList(currentList, 'homepage')}</Grid>
      </Grid>}

      {cmsTab === 'courses' && <Grid container spacing={3} className="cmsContentGrid">
        <Grid item xs={12} lg={6}><Box className="cmsFormPanel" component="form" onSubmit={(e) => { e.preventDefault(); saveItem('courses', courseForm) }}><Stack spacing={2.25}>
          <Typography variant="h6" fontWeight={900}>Content editor</Typography>
          <Typography color="text.secondary">{formTitleMap.courses}</Typography>
          {localeField(courseForm, setCourseForm)}
          <TextField required label={d.courseTitle} value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
          <Stack direction="row" spacing={2}><TextField label={d.age} value={courseForm.age || ''} onChange={(e) => setCourseForm({ ...courseForm, age: e.target.value })} /><TextField label={d.level} value={courseForm.level || ''} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} /></Stack>
          {imageField(courseForm, setCourseForm)}
          <TextField required multiline minRows={3} label={d.description} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
          <TextField multiline minRows={3} label={d.outcomes} value={courseForm.outcomes || ''} onChange={(e) => setCourseForm({ ...courseForm, outcomes: e.target.value })} />
          {publishField(courseForm, setCourseForm)}
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained">{d.saveCourse}</Button><Button onClick={resetForms}>{d.clear}</Button></Stack>
        </Stack></Box></Grid>
        <Grid item xs={12} lg={6}>{renderCmsList(currentList, 'courses')}</Grid>
      </Grid>}

      {cmsTab === 'teachers' && <Grid container spacing={3} className="cmsContentGrid">
        <Grid item xs={12} lg={6}><Box className="cmsFormPanel" component="form" onSubmit={(e) => { e.preventDefault(); saveItem('teachers', teacherForm) }}><Stack spacing={2.25}>
          <Typography variant="h6" fontWeight={900}>Content editor</Typography>
          <Typography color="text.secondary">{formTitleMap.teachers}</Typography>
          {localeField(teacherForm, setTeacherForm)}
          <TextField required label={d.name} value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
          <TextField required label={d.publicRole} value={teacherForm.role} onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })} />
          {imageField(teacherForm, setTeacherForm)}
          <TextField label={d.initials} value={teacherForm.initials || ''} onChange={(e) => setTeacherForm({ ...teacherForm, initials: e.target.value })} />
          <TextField required multiline minRows={4} label={d.bio} value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} />
          {publishField(teacherForm, setTeacherForm)}
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained">{d.saveTeacherProfile}</Button><Button onClick={resetForms}>{d.clear}</Button></Stack>
        </Stack></Box></Grid>
        <Grid item xs={12} lg={6}>{renderCmsList(currentList, 'teachers')}</Grid>
      </Grid>}

      {cmsTab === 'testimonials' && <Grid container spacing={3} className="cmsContentGrid">
        <Grid item xs={12} lg={6}><Box className="cmsFormPanel" component="form" onSubmit={(e) => { e.preventDefault(); saveItem('testimonials', testimonialForm) }}><Stack spacing={2.25}>
          <Typography variant="h6" fontWeight={900}>Content editor</Typography>
          <Typography color="text.secondary">{formTitleMap.testimonials}</Typography>
          {localeField(testimonialForm, setTestimonialForm)}
          <TextField required label={d.studentLabel} value={testimonialForm.student} onChange={(e) => setTestimonialForm({ ...testimonialForm, student: e.target.value })} />
          {imageField(testimonialForm, setTestimonialForm)}
          <TextField required multiline minRows={3} label={d.result} value={testimonialForm.result} onChange={(e) => setTestimonialForm({ ...testimonialForm, result: e.target.value })} />
          <TextField required multiline minRows={3} label={d.parentQuote} value={testimonialForm.parent_quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, parent_quote: e.target.value })} />
          {publishField(testimonialForm, setTestimonialForm)}
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained">{d.saveTestimonial}</Button><Button onClick={resetForms}>{d.clear}</Button></Stack>
        </Stack></Box></Grid>
        <Grid item xs={12} lg={6}>{renderCmsList(currentList, 'testimonials')}</Grid>
      </Grid>}

      {cmsTab === 'posts' && <Grid container spacing={3} className="cmsContentGrid">
        <Grid item xs={12} lg={6}><Box className="cmsFormPanel" component="form" onSubmit={(e) => { e.preventDefault(); saveItem('posts', postForm) }}><Stack spacing={2.25}>
          <Typography variant="h6" fontWeight={900}>Content editor</Typography>
          <Typography color="text.secondary">{formTitleMap.posts}</Typography>
          {localeField(postForm, setPostForm)}
          <TextField required label={d.slug} helperText={d.slugHelp} value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
          <TextField required label={d.title} value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
          {imageField(postForm, setPostForm)}
          <TextField required multiline minRows={2} label={d.excerpt} value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} />
          <TextField label={d.readTime} value={postForm.read_time || ''} onChange={(e) => setPostForm({ ...postForm, read_time: e.target.value })} />
          <TextField required multiline minRows={6} label={d.content} value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
          {publishField(postForm, setPostForm)}
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained">{d.saveBlogPost}</Button><Button onClick={resetForms}>{d.clear}</Button></Stack>
        </Stack></Box></Grid>
        <Grid item xs={12} lg={6}>{renderCmsList(currentList, 'posts')}</Grid>
      </Grid>}
    </CardContent></Card>
  )

  function renderCmsList(items, type) {
    return <Stack spacing={2}>
      <Typography variant="h6" fontWeight={900}>Existing content</Typography>
      {items.map((item) => <Paper className="listRow cmsListRow" key={`${type}-${item.id}`}><Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <CmsThumb src={item.image_url ? (item.image_url.startsWith('/media') ? `${API_URL}${item.image_url}` : item.image_url) : ''} alt={item.image_alt || item.title || item.name || item.student || 'CMS image'} />
          <Box>
            <Typography fontWeight={900}>{item.title || item.name || item.student || item.eyebrow || 'Homepage hero'}</Typography>
            <Typography color="text.secondary">{item.role || item.level || item.read_time || item.result || item.card_title || item.subtitle}</Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={(item.locale || 'en').toUpperCase()} />
          <Chip color={item.is_published ? 'success' : 'default'} label={item.is_published ? d.published : d.hidden} />
        </Stack>
      </Stack>
      <Typography color="text.secondary">{item.description || item.bio || item.excerpt || item.parent_quote || item.subtitle}</Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => {
          setEditing({ type, id: item.id })
          if (type === 'homepage') setHeroForm(item)
          if (type === 'courses') setCourseForm(item)
          if (type === 'teachers') setTeacherForm(item)
          if (type === 'testimonials') setTestimonialForm(item)
          if (type === 'posts') setPostForm(item)
        }}>{d.edit}</Button>
        <Button size="small" color="error" onClick={() => deleteItem(type, item.id)}>{d.delete}</Button>
      </Stack>
    </Stack></Paper>)}
    </Stack>
  }
}

function CmsThumb({ src, alt }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <Box className="cmsThumb cmsThumbFallback" aria-hidden="true">No image</Box>
  return <img className="cmsThumb" src={src} alt={alt} onError={() => setFailed(true)} />
}

function AdminDashboard({ setMessage, refreshCounters, locale }) {
  const d = getDashboardText(locale)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', specialty: 'Children beginner piano', password: 'teacher123' })

  async function load() {
    const [t, s, r] = await Promise.all([api('/teachers'), api('/students'), api('/advice-records')])
    setTeachers(t); setStudents(s); setRecords(r)
  }
  useEffect(() => { load().catch((e) => setMessage({ type: 'error', text: e.message })) }, [])

  async function createTeacher(e) {
    e.preventDefault()
    try {
      const teacher = await api('/teachers', { method: 'POST', body: JSON.stringify(teacherForm) })
      setMessage({ type: 'success', text: `${d.teacherCreated}: ${teacher.email}. ${d.defaultPassword}: ${teacherForm.password}` })
      setTeacherForm({ name: '', email: '', specialty: 'Children beginner piano', password: 'teacher123' })
      await load(); await refreshCounters()
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} lg={3}><StatCard title={d.adminStats.teachers} value={teachers.length} icon={<SchoolIcon />} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><StatCard title={d.adminStats.students} value={students.length} icon={<FamilyRestroomIcon />} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><StatCard title={d.adminStats.feedbackRecords} value={records.length} icon={<DashboardIcon />} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><StatCard title={d.adminStats.aiAdviceSaved} value={records.filter((r) => r.ai_advice_generated_at).length} icon={<CheckCircleIcon />} /></Grid>

      <Grid item xs={12} lg={4}>
        <Card><CardContent>
          <SectionHeader icon={<PersonAddIcon />} title={d.createTeacher} subtitle={d.createTeacherSub} />
          <Box component="form" onSubmit={createTeacher}>
            <Stack spacing={2}>
              <TextField required label={d.teacherName} value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
              <TextField required type="email" label={d.teacherEmail} value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
              <TextField label={d.specialty} value={teacherForm.specialty} onChange={(e) => setTeacherForm({ ...teacherForm, specialty: e.target.value })} />
              <TextField required label={d.initialPassword} value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} />
              <Button type="submit" variant="contained" size="large">{d.createTeacherAccount}</Button>
            </Stack>
          </Box>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card><CardContent>
          <SectionHeader icon={<AdminPanelSettingsIcon />} title={d.overview} subtitle={d.overviewSub} />
          <Stack spacing={2}>
            {teachers.map((t) => (
              <Paper key={t.id} className="listRow">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box><Typography fontWeight={900}>{t.name}</Typography><Typography color="text.secondary">{t.email} · {t.specialty || d.noSpecialty}</Typography></Box>
                  <Chip label={`${students.filter((s) => s.teacher_id === t.id).length} ${d.students}`} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12}>
        <PublicContentAdmin setMessage={setMessage} locale={locale} />
      </Grid>
    </Grid>
  )
}

function TeacherDashboard({ setMessage, refreshCounters, locale }) {
  const d = getDashboardText(locale)
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])
  const [studentForm, setStudentForm] = useState({ name: '', age: 5, level: 'Beginner', parent_name: '', parent_email: '', parent_password: 'parent123' })
  const [recordForm, setRecordForm] = useState({ student_id: '', piece_title: 'Canon in D', teacher_feedback: '' })
  const [loadingId, setLoadingId] = useState(null)

  async function load() {
    const [s, r] = await Promise.all([api('/students'), api('/advice-records')])
    setStudents(s); setRecords(r)
  }
  useEffect(() => { load().catch((e) => setMessage({ type: 'error', text: e.message })) }, [])

  async function createStudent(e) {
    e.preventDefault()
    try {
      const payload = {
        ...studentForm,
        age: studentForm.age ? Number(studentForm.age) : null,
        parent_name: studentForm.parent_name || null,
        parent_email: studentForm.parent_email || null,
        parent_password: studentForm.parent_email ? (studentForm.parent_password || 'parent123') : null,
      }
      const student = await api('/students', { method: 'POST', body: JSON.stringify(payload) })
      setMessage({ type: 'success', text: `${d.studentCreated}: ${student.name}. ${d.parentLoginIs} ${student.parent_email || d.notSetYet}.` })
      setStudentForm({ name: '', age: 5, level: 'Beginner', parent_name: '', parent_email: '', parent_password: 'parent123' })
      await load(); await refreshCounters()
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }

  async function createFeedback(e) {
    e.preventDefault()
    try {
      const payload = { ...recordForm, student_id: Number(recordForm.student_id) }
      const record = await api('/advice-records', { method: 'POST', body: JSON.stringify(payload) })
      setMessage({ type: 'success', text: `${d.feedbackSaved} for ${record.student.name}. ${d.generateReady}` })
      setRecordForm({ student_id: recordForm.student_id, piece_title: '', teacher_feedback: '' })
      await load(); await refreshCounters()
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
  }

  async function generateAdvice(id) {
    setLoadingId(id)
    try {
      await api(`/advice-records/${id}/generate-ai`, { method: 'POST' })
      setMessage({ type: 'success', text: d.aiGeneratedSaved })
      await load(); await refreshCounters()
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
    finally { setLoadingId(null) }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}><StatCard title={d.myStudents} value={students.length} icon={<FamilyRestroomIcon />} /></Grid>
      <Grid item xs={12} md={3}><StatCard title={d.adminStats.feedbackRecords} value={records.length} icon={<DashboardIcon />} /></Grid>
      <Grid item xs={12} md={3}><StatCard title={d.aiSaved} value={records.filter((r) => r.ai_advice_generated_at).length} icon={<AutoAwesomeIcon />} /></Grid>
      <Grid item xs={12} md={3}><StatCard title={d.waitingAI} value={records.filter((r) => !r.ai_advice_generated_at).length} icon={<PianoIcon />} /></Grid>

      <Grid item xs={12} lg={4}>
        <Card><CardContent>
          <SectionHeader icon={<SchoolIcon />} title={d.createStudent} subtitle={d.createStudentSub} />
          <Box component="form" onSubmit={createStudent}>
            <Stack spacing={2}>
              <TextField required label={d.studentName} value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
              <Stack direction="row" spacing={2}>
                <TextField type="number" label={d.age} value={studentForm.age} onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })} />
                <TextField label={d.level} value={studentForm.level} onChange={(e) => setStudentForm({ ...studentForm, level: e.target.value })} />
              </Stack>
              <TextField label={d.parentName} value={studentForm.parent_name} onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
              <TextField type="email" label={d.parentEmail} value={studentForm.parent_email} onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })} />
              <TextField label={d.parentInitialPassword} value={studentForm.parent_password} onChange={(e) => setStudentForm({ ...studentForm, parent_password: e.target.value })} disabled={!studentForm.parent_email} />
              <Button type="submit" variant="contained" size="large">{d.createStudent}</Button>
            </Stack>
          </Box>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card sx={{ mb: 3 }}><CardContent>
          <SectionHeader icon={<AutoAwesomeIcon />} title={d.createLessonFeedback} subtitle={d.createLessonFeedbackSub} />
          <Box component="form" onSubmit={createFeedback}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth required>
                  <InputLabel>{d.student}</InputLabel>
                  <Select label={d.student} value={recordForm.student_id} onChange={(e) => setRecordForm({ ...recordForm, student_id: e.target.value })}>
                    {students.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} · {s.level}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={7}><TextField fullWidth required label={d.pieceTitle} value={recordForm.piece_title} onChange={(e) => setRecordForm({ ...recordForm, piece_title: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth required multiline minRows={4} label={d.teacherFeedback} value={recordForm.teacher_feedback} onChange={(e) => setRecordForm({ ...recordForm, teacher_feedback: e.target.value })} /></Grid>
              <Grid item xs={12}><Button type="submit" variant="contained" size="large" disabled={!students.length}>{d.saveFeedback}</Button></Grid>
            </Grid>
          </Box>
        </CardContent></Card>

        <Card><CardContent>
          <SectionHeader icon={<DashboardIcon />} title={d.feedbackAdviceRecords} subtitle={d.feedbackAdviceRecordsSub} />
          <Stack spacing={2}>
            {records.map((r) => (
              <Paper key={r.id} className="recordCard">
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography fontWeight={900}>{r.student.name} · {r.piece_title}</Typography>
                      <Typography color="text.secondary">{d.created} {new Date(r.created_at).toLocaleString()}</Typography>
                    </Box>
                    <Chip color={r.ai_advice_generated_at ? 'success' : 'warning'} label={r.ai_advice_generated_at ? d.aiAdviceSavedChip : d.waitingForAI} />
                  </Stack>
                  <Typography><b>{d.teacherFeedback}:</b> {r.teacher_feedback}</Typography>
                  {r.ai_parent_advice && <Alert severity="success"><b>{d.parentAdvice}:</b><br />{r.ai_parent_advice}</Alert>}
                  {loadingId === r.id && <LinearProgress />}
                  <Button variant="contained" startIcon={<AutoAwesomeIcon />} disabled={Boolean(r.ai_advice_generated_at) || loadingId === r.id} onClick={() => generateAdvice(r.id)}>
                    {r.ai_advice_generated_at ? d.aiAlreadyGenerated : d.generateAIOnce}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

function ParentDashboard({ setMessage, locale }) {
  const d = getDashboardText(locale)
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    Promise.all([api('/parent/students'), api('/parent/advice-records')])
      .then(([s, r]) => { setStudents(s); setRecords(r) })
      .catch((e) => setMessage({ type: 'error', text: e.message }))
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}><StatCard title={d.myChildren} value={students.length} icon={<FamilyRestroomIcon />} /></Grid>
      <Grid item xs={12} md={4}><StatCard title={d.parentTeacherFeedback} value={records.length} icon={<DashboardIcon />} /></Grid>
      <Grid item xs={12} md={4}><StatCard title={d.aiAdviceSavedStat} value={records.filter((r) => r.ai_parent_advice).length} icon={<CheckCircleIcon />} /></Grid>

      <Grid item xs={12} lg={4}>
        <Card><CardContent>
          <SectionHeader icon={<FamilyRestroomIcon />} title={d.myChild} subtitle={d.myChildSub} />
          <Stack spacing={2}>
            {students.map((s) => (
              <Paper key={s.id} className="listRow">
                <Typography fontWeight={900}>{s.name}</Typography>
                <Typography color="text.secondary">{d.ageLabel} {s.age || '-'} · {s.level}</Typography>
                <Typography color="text.secondary">{d.teacher}: {s.teacher.name}</Typography>
              </Paper>
            ))}
          </Stack>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card><CardContent>
          <SectionHeader icon={<CheckCircleIcon />} title={d.savedResultsAdvice} subtitle={d.savedResultsAdviceSub} />
          <Stack spacing={2}>
            {records.length === 0 && <Alert severity="info">{d.noAdviceYet}</Alert>}
            {records.map((r) => (
              <Paper key={r.id} className="recordCard parentRecord">
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={900}>{r.student.name} · {r.piece_title}</Typography>
                      <Typography color="text.secondary">{d.teacher}: {r.teacher.name} · {new Date(r.created_at).toLocaleDateString()}</Typography>
                    </Box>
                    <Chip color="success" label={d.savedAdvice} />
                  </Stack>
                  <Divider />
                  <Typography><b>{d.teacherFeedback}:</b> {r.teacher_feedback}</Typography>
                  <Alert severity="success"><b>{d.aiAdviceForParent}:</b><br />{r.ai_parent_advice}</Alert>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

function MainApp() {
  const params = useParams()
  const locale = normalizeLocale(params?.locale)
  const d = getDashboardText(locale)
  const [user, setUser] = useState(null)
  const [aiStatus, setAiStatus] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshCounters() {
    const [status, dash] = await Promise.all([api('/ai/status'), api('/dashboard')])
    setAiStatus(status); setDashboard(dash)
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    api('/auth/me')
      .then((u) => { setUser(u); return refreshCounters() })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function onLogin(u) {
    setUser(u)
    await refreshCounters()
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null); setDashboard(null); setAiStatus(null); setMessage(null)
  }

  if (loading) return <ThemeProvider theme={theme}><CssBaseline /><Box sx={{ p: 4 }}><LinearProgress /></Box></ThemeProvider>
  if (!user) return <ThemeProvider theme={theme}><CssBaseline /><LoginPage onLogin={onLogin} locale={locale} /></ThemeProvider>

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell user={user} aiStatus={aiStatus} dashboard={dashboard} onLogout={logout} locale={locale}>
        {message && <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>{message.text}</Alert>}
        <Box sx={{ mb: 3 }}>
          <Tabs value={user.role} textColor="primary" indicatorColor="primary">
            <Tab value={user.role} label={`${d.roles[user.role] || user.role} ${d.dashboardLabel}`} />
          </Tabs>
        </Box>
        {user.role === 'admin' && <AdminDashboard setMessage={setMessage} refreshCounters={refreshCounters} locale={locale} />}
        {user.role === 'teacher' && <TeacherDashboard setMessage={setMessage} refreshCounters={refreshCounters} locale={locale} />}
        {user.role === 'parent' && <ParentDashboard setMessage={setMessage} locale={locale} />}
      </AppShell>
    </ThemeProvider>
  )
}

export default function Page() {
  return <MainApp />
}
