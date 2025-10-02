import { createClient } from './server'
import type { Database } from './database.types'
import type { Poetry, Comment, UserInfo, PoemRequest } from '../definitions'

type SupabasePoetry = Database['public']['Tables']['poetry']['Row']
type SupabaseUser = Database['public']['Tables']['users']['Row']
type SupabaseComment = Database['public']['Tables']['poetry_comments']['Row']
type SupabaseLike = Database['public']['Tables']['poetry_likes']['Row']
type SupabaseRequest = Database['public']['Tables']['poem_requests']['Row']

// Transform Supabase types to app types
function transformSupabasePoetry(poetry: any): Poetry {
  const likes = poetry.poetry_likes || []
  const comments = poetry.poetry_comments || []
  return {
    id: poetry.id,
    title: poetry.title,
    genre: poetry.genre,
    caption: poetry.caption || undefined,
    poem: poetry.poem,
    image: {
      id: poetry.id,
      imageUrl: poetry.image_url || '',
      imageHint: 'poetry image',
      description: poetry.image_description || poetry.title,
    },
    likes: likes.map((like: any) => ({
      id: like.user_id,
      name: like.users?.name || 'Anonymous',
      photo: like.users?.photo || null,
    })),
    comments: comments.map((comment: any) => ({
      id: comment.id,
      text: comment.text,
      user: {
        id: comment.user_id,
        name: comment.users?.name || 'Anonymous',
        photo: comment.users?.photo || null,
      },
    })),
  }
}

function transformSupabaseRequest(request: SupabaseRequest): PoemRequest {
  return {
    id: request.id,
    name: request.name,
    topic: request.topic,
    genre: request.genre as 'Love' | 'Sad' | 'Motivational' | 'Nature',
    mood: request.mood,
    description: request.description,
    createdAt: request.created_at,
    completed: request.completed,
  }
}

// Poetry queries
export async function getPoetryData(): Promise<Poetry[]> {
  const supabase = await createClient()
  
  const { data: poetryData, error } = await supabase
    .from('poetry')
    .select(`
      *,
      poetry_likes (
        user_id,
        users (*)
      ),
      poetry_comments (
        id,
        text,
        user_id,
        created_at,
        users (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching poetry:', error)
    return []
  }

  return poetryData.map(poetry => transformSupabasePoetry(poetry))
}

export async function addPoetry(poetry: Omit<Poetry, 'likes' | 'comments'>): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poetry')
    .insert({
      id: poetry.id,
      title: poetry.title,
      genre: poetry.genre,
      caption: poetry.caption,
      poem: poetry.poem,
      image_url: poetry.image.imageUrl,
      image_description: poetry.image.description,
    })

  if (error) {
    console.error('Error adding poetry:', error)
    throw new Error('Failed to add poetry')
  }
}

export async function deletePoetryById(poetryId: string): Promise<Poetry | undefined> {
  const supabase = await createClient()
  
  // First get the poetry to return it
  const { data: poetry, error: fetchError } = await supabase
    .from('poetry')
    .select(`
      *,
      poetry_likes (
        user_id,
        users (*)
      ),
      poetry_comments (
        id,
        text,
        user_id,
        created_at,
        users (*)
      )
    `)
    .eq('id', poetryId)
    .single()

  if (fetchError || !poetry) {
    console.error('Error fetching poetry for deletion:', fetchError)
    return undefined
  }

  // Delete the poetry (cascade will handle likes and comments)
  const { error: deleteError } = await supabase
    .from('poetry')
    .delete()
    .eq('id', poetryId)

  if (deleteError) {
    console.error('Error deleting poetry:', deleteError)
    return undefined
  }

  return transformSupabasePoetry(poetry)
}

export async function updatePoetryLikes(poetryId: string, user: UserInfo, isLiked: boolean): Promise<void> {
  const supabase = await createClient()
  
  if (isLiked) {
    // Add like
    const { error } = await supabase
      .from('poetry_likes')
      .upsert({
        poetry_id: poetryId,
        user_id: user.id,
      }, {
        onConflict: 'poetry_id,user_id'
      })

    if (error) {
      console.error('Error adding like:', error)
      throw new Error('Failed to add like')
    }
  } else {
    // Remove like
    const { error } = await supabase
      .from('poetry_likes')
      .delete()
      .eq('poetry_id', poetryId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing like:', error)
      throw new Error('Failed to remove like')
    }
  }
}

export async function addCommentToPoetry(poetryId: string, commentText: string, user: UserInfo): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poetry_comments')
    .insert({
      poetry_id: poetryId,
      user_id: user.id,
      text: commentText,
    })

  if (error) {
    console.error('Error adding comment:', error)
    throw new Error('Failed to add comment')
  }
}

export async function deleteCommentFromPoetry(poetryId: string, commentId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poetry_comments')
    .delete()
    .eq('id', commentId)
    .eq('poetry_id', poetryId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw new Error('Failed to delete comment')
  }
}

// Request queries
export async function getRequests(): Promise<PoemRequest[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('poem_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching requests:', error)
    return []
  }

  return data.map(transformSupabaseRequest)
}

export async function addRequest(request: PoemRequest): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poem_requests')
    .insert({
      id: request.id,
      name: request.name,
      topic: request.topic,
      genre: request.genre,
      mood: request.mood,
      description: request.description,
      completed: request.completed,
    })

  if (error) {
    console.error('Error adding request:', error)
    throw new Error('Failed to add request')
  }
}

export async function updateRequestStatus(id: string, completed: boolean): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poem_requests')
    .update({ completed })
    .eq('id', id)

  if (error) {
    console.error('Error updating request status:', error)
    throw new Error('Failed to update request status')
  }
}

export async function deleteRequestById(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('poem_requests')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting request:', error)
    throw new Error('Failed to delete request')
  }
}