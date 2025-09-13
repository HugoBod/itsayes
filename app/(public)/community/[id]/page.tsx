import { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { serverCommunityService } from '@/lib/community-server'
import { PublicMagazineMoodboard } from '@/components/magazine/PublicMagazineMoodboard'
import { anonymizeProjectData } from '@/lib/privacy-filter'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Cache the database call to prevent duplicate queries
const getCachedProject = cache(async (id: string) => {
  console.log('🔍 ServerCommunityService.getProjectById called with id:', id)
  return await serverCommunityService.getProjectById(id)
})

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { project, error } = await getCachedProject(id)

  if (error || !project) {
    return {
      title: 'Project Not Found - It\'s a Yes',
      description: 'The wedding project you\'re looking for could not be found.'
    }
  }

  // Extract style preferences
  let styleThemes = []
  let colorPalette = null

  try {
    if (project.style_preferences) {
      const styleData = JSON.parse(project.style_preferences)
      styleThemes = styleData.themes || []
      colorPalette = styleData.colorPalette
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return {
    title: `${project.name} - Wedding Inspiration | It's a Yes`,
    description: project.description || `Beautiful ${styleThemes.join(', ') || 'wedding'} inspiration.`,

    // Open Graph tags for social sharing
    openGraph: {
      title: project.name,
      description: project.description || `Beautiful wedding inspiration`,
      type: 'article',
      images: project.featured_image_url ? [
        {
          url: project.featured_image_url,
          width: 1200,
          height: 630,
          alt: `${project.name} - Wedding inspiration`
        }
      ] : [],
      siteName: "It's a Yes - Wedding Planning"
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description: project.description || `Beautiful wedding inspiration`,
      images: project.featured_image_url ? [project.featured_image_url] : []
    },

    // Additional SEO
    keywords: [
      'wedding inspiration',
      'wedding planning',
      ...styleThemes,
      colorPalette,
      'wedding ideas',
      'moodboard'
    ].filter(Boolean).join(', ')
  }
}

export default async function PublicProjectPage({ params }: PageProps) {
  // Fetch project data (cached to avoid duplicate calls)
  const { id } = await params
  const { project, error } = await getCachedProject(id)

  if (error || !project) {
    notFound()
  }

  // Anonymize project data for public display
  const anonymizedData = anonymizeProjectData(project)

  return (
    <div className="min-h-screen bg-white">
      {/* SEO-friendly structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": project.name,
            "description": project.description,
            "image": project.featured_image_url,
            "datePublished": project.created_at,
            "author": {
              "@type": "Organization",
              "name": "It's a Yes"
            },
            "publisher": {
              "@type": "Organization",
              "name": "It's a Yes",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            }
          })
        }}
      />

      {/* Public Magazine Moodboard */}
      <PublicMagazineMoodboard
        projectData={anonymizedData}
        originalSlug={project.public_id}
      />
    </div>
  )
}

// Enable static generation for public projects (optional optimization)
export const dynamic = 'force-dynamic' // Force dynamic for real-time view tracking
export const revalidate = 3600 // Revalidate every hour