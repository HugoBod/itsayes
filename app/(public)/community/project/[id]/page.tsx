import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { serverCommunityService } from '@/lib/community-server'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// This route handles legacy workspace ID URLs and redirects to the proper public_id URL
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Redirecting... - It\'s a Yes',
    description: 'Redirecting to the project page'
  }
}

export default async function ProjectByWorkspaceIdPage({ params }: PageProps) {
  const { id } = await params

  // Try to find the workspace by its ID and get its public_id for redirect
  try {
    const { publicId, error } = await serverCommunityService.getPublicIdByWorkspaceId(id)

    if (error || !publicId) {
      // If workspace is not public or doesn't exist, redirect to community
      redirect('/community')
    }

    // Redirect to the proper public_id URL
    redirect(`/community/${publicId}`)
  } catch (error) {
    notFound()
  }
}

export const dynamic = 'force-dynamic'