import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

// This edge function handles webhooks for real-time updates to posts and comments
// It can be called by the client to get the latest data

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key (to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const { action, type, postId, userId, parentId } = await req.json()

    // Define the response object
    const responseObj: Record<string, any> = {
      success: true,
      data: null,
      error: null
    }

    // Handle different action types
    switch (type) {
      case 'posts': {
        // Get the latest posts with user info
        if (action === 'get_latest') {
          const { data, error } = await supabaseAdmin
            .from('posts')
            .select(`
              *,
              profiles:user_id (username, avatar_url, bdsm_role),
              post_likes:post_likes (count)
            `)
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (error) throw error
          
          responseObj.data = data
        }
        break
      }
      
      case 'comments': {
        // Get comments for a post
        if (action === 'get_post_comments') {
          if (!postId) throw new Error('postId is required for get_post_comments')
          
          const { data, error } = await supabaseAdmin
            .from('comments')
            .select(`
              *,
              profiles:user_id (username, avatar_url, bdsm_role)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
          
          if (error) throw error
          
          responseObj.data = data
        }
        
        // Get replies to a comment
        if (action === 'get_comment_replies') {
          if (!parentId) throw new Error('parentId is required for get_comment_replies')
          
          const { data, error } = await supabaseAdmin
            .from('comments')
            .select(`
              *,
              profiles:user_id (username, avatar_url, bdsm_role)
            `)
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true })
          
          if (error) throw error
          
          responseObj.data = data
        }
        break
      }
      
      case 'likes': {
        // Get like count for a post
        if (action === 'get_post_likes') {
          if (!postId) throw new Error('postId is required for get_post_likes')
          
          const { count, error } = await supabaseAdmin
            .from('post_likes')
            .select('id', { count: 'exact' })
            .eq('post_id', postId)
          
          if (error) throw error
          
          responseObj.data = { count }
        }
        
        // Check if user has liked a post
        if (action === 'has_user_liked') {
          if (!postId) throw new Error('postId is required for has_user_liked')
          if (!userId) throw new Error('userId is required for has_user_liked')
          
          const { data, error } = await supabaseAdmin
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .maybeSingle()
          
          if (error) throw error
          
          responseObj.data = { liked: !!data }
        }
        break
      }
      
      default:
        throw new Error(`Unknown type: ${type}`)
    }

    // Return the response
    return new Response(
      JSON.stringify(responseObj),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})