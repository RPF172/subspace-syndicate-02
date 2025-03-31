import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL expiration time (15 minutes)
const URL_EXPIRATION = 15 * 60;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the request body
    const { fileUrl, fileType, applicationId } = await req.json();

    if (!fileUrl || !fileType || !applicationId) {
      throw new Error('Missing required parameters');
    }

    // Verify the user has access to this application
    const { data: application, error: applicationError } = await supabaseClient
      .from('creator_applications')
      .select('user_id')
      .eq('id', applicationId)
      .single();

    if (applicationError) throw applicationError;

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Check if user has permission to view the application
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin';
    const isManager = userRole?.role === 'manager';
    const isOwner = application.user_id === user.id;

    if (!isAdmin && !isManager && !isOwner) {
      throw new Error('Unauthorized access');
    }

    // Generate signed URL
    const { data: signedUrl, error: signedUrlError } = await supabaseClient
      .storage
      .from('applications')
      .createSignedUrl(fileUrl, URL_EXPIRATION);

    if (signedUrlError) throw signedUrlError;

    // Log the access
    const { error: logError } = await supabaseClient
      .from('file_access_logs')
      .insert({
        application_id: applicationId,
        file_type: fileType,
        accessed_by: user.id,
        access_time: new Date().toISOString(),
        expires_at: new Date(Date.now() + URL_EXPIRATION * 1000).toISOString(),
      });

    if (logError) {
      console.error('Error logging file access:', logError);
      // Don't throw here, as the URL is still valid
    }

    // Return the signed URL and expiration time
    return new Response(
      JSON.stringify({
        url: signedUrl.signedUrl,
        expiresAt: new Date(Date.now() + URL_EXPIRATION * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 