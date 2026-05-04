import './globals.css'

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Piano Academy AI | Piano Lessons for Kids and Parent Feedback',
    template: '%s | Piano Academy AI',
  },
  description: 'A professional piano academy website and dashboard with children piano courses, teachers, student results, parent communication, and AI-assisted practice advice.',
  keywords: ['piano academy', 'children piano lessons', 'music education', 'teacher feedback', 'AI parent advice', 'piano courses for kids'],
  openGraph: {
    title: 'Piano Academy AI',
    description: 'Piano lessons, teacher feedback, AI-assisted parent advice, and student progress tracking for modern academies.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
