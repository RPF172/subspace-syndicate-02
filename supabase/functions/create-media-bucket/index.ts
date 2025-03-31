
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get('Authorization');
    
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get bucket name from request body
    let bucketName = 'post_media'; // Default bucket name
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.bucket_name) {
          bucketName = body.bucket_name;
        }
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    }

    console.log(`Creating bucket: ${bucketName}`);

    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return new Response(
        JSON.stringify({ message: `Bucket ${bucketName} already exists` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
    });

    if (error) {
      console.error('Error creating bucket:', error);
      throw error;
    }

    console.log(`Bucket ${bucketName} created successfully`);

    // Create RLS policies for the bucket
    const sqlQueries = [
      // Allow media to be viewed by anyone
      `CREATE POLICY "Media is viewable by everyone"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = '${bucketName}');`,

      // Allow authenticated users to upload
      `CREATE POLICY "Users can upload ${bucketName}"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = '${bucketName}');`,

      // Allow users to update their own uploads
      `CREATE POLICY "Users can update their own ${bucketName}"
        ON storage.objects
        FOR UPDATE
        USING (bucket_id = '${bucketName}' AND owner = auth.uid());`,

      // Allow users to delete their own uploads
      `CREATE POLICY "Users can delete their own ${bucketName}"
        ON storage.objects
        FOR DELETE
        USING (bucket_id = '${bucketName}' AND owner = auth.uid());`
    ];

    for (const sql of sqlQueries) {
      const { error: policyError } = await supabaseAdmin.rpc('pgrest_exec', { source: sql });
      if (policyError) {
        console.error('Error creating policy:', policyError);
        // Continue with other policies even if one fails
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Bucket ${bucketName} created successfully with policies` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error in create-media-bucket function:', err);
    
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
