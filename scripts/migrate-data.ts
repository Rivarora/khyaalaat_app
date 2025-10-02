/**
 * Data migration utility to move existing JSON data to Supabase
 * Run this script after setting up Supabase to migrate your existing data
 */

import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'
import type { Database } from '../src/lib/supabase/database.types'

// This would be run as a Node.js script, so we need to load env vars
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function migratePoetryData() {
  try {
    const poetryPath = path.join(process.cwd(), 'src', 'lib', 'poetry.json')
    const fileContent = await fs.readFile(poetryPath, 'utf-8')
    const poetryData = JSON.parse(fileContent)

    console.log(`Found ${poetryData.length} poetry items to migrate`)

    for (const poem of poetryData) {
      // Migrate poetry
      const { error: poetryError } = await supabase
        .from('poetry')
        .upsert({
          id: poem.id,
          title: poem.title,
          poem: poem.poem,
          caption: poem.caption,
          genre: poem.genre,
          image_url: poem.image?.imageUrl,
          image_description: poem.image?.description,
          created_at: new Date().toISOString(), // You might want to preserve original dates
        })

      if (poetryError) {
        console.error(`Error migrating poetry ${poem.id}:`, poetryError)
        continue
      }

      // Migrate likes (if any)
      if (poem.likes && Array.isArray(poem.likes)) {
        for (const like of poem.likes) {
          const { error: likeError } = await supabase
            .from('poetry_likes')
            .upsert({
              poetry_id: poem.id,
              user_id: like.id,
            })

          if (likeError) {
            console.error(`Error migrating like for poetry ${poem.id}:`, likeError)
          }
        }
      }

      // Migrate comments (if any)
      if (poem.comments && Array.isArray(poem.comments)) {
        for (const comment of poem.comments) {
          const { error: commentError } = await supabase
            .from('poetry_comments')
            .upsert({
              id: comment.id,
              poetry_id: poem.id,
              user_id: comment.user?.id || 'legacy-user',
              text: comment.text,
            })

          if (commentError) {
            console.error(`Error migrating comment for poetry ${poem.id}:`, commentError)
          }
        }
      }

      console.log(`✓ Migrated poetry: ${poem.title}`)
    }

    console.log('Poetry migration completed!')

  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('No poetry.json file found - skipping poetry migration')
    } else {
      console.error('Error reading poetry data:', error)
    }
  }
}

async function migrateRequestData() {
  try {
    const requestsPath = path.join(process.cwd(), 'src', 'lib', 'requests.json')
    const fileContent = await fs.readFile(requestsPath, 'utf-8')
    const requestData = JSON.parse(fileContent)

    console.log(`Found ${requestData.length} requests to migrate`)

    for (const request of requestData) {
      const { error } = await supabase
        .from('poem_requests')
        .upsert({
          id: request.id,
          name: request.name,
          topic: request.topic,
          genre: request.genre,
          mood: request.mood,
          description: request.description,
          completed: request.completed || false,
          created_at: request.createdAt || new Date().toISOString(),
        })

      if (error) {
        console.error(`Error migrating request ${request.id}:`, error)
        continue
      }

      console.log(`✓ Migrated request: ${request.name}`)
    }

    console.log('Requests migration completed!')

  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('No requests.json file found - skipping requests migration')
    } else {
      console.error('Error reading request data:', error)
    }
  }
}

async function main() {
  console.log('Starting data migration to Supabase...')
  
  await migratePoetryData()
  await migrateRequestData()
  
  console.log('Migration completed!')
}

if (require.main === module) {
  main().catch(console.error)
}

export { migratePoetryData, migrateRequestData }