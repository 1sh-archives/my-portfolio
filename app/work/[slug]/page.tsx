import { notFound } from 'next/navigation'

const projectSlugs = ['sponge-divers', 'inkiosk', 'seven-deadly-sins']

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }))
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!projectSlugs.includes(slug)) notFound()

  return <main className="min-h-screen bg-[#070707]" aria-label="Project page" />
}
