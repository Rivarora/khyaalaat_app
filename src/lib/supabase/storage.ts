import { supabase } from './client'
import { createClient } from './server'

export const BUCKET_NAME = 'poetry-images'

export async function uploadImage(file: File, userId: string): Promise<{ url: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: '', error: error.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: '', error: 'Failed to upload image' }
  }
}

export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract the path from the full URL
    const urlParts = url.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid image URL' }
    }
    
    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

export async function getImageUrl(path: string): Promise<string> {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  
  return data.publicUrl
}