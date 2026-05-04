import { redirect } from 'next/navigation'
export default function Page({ params }) { redirect(`/en/blog/${params.slug}`) }
