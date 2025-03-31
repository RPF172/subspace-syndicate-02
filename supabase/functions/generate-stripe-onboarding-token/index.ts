import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum requests per hour

interface RateLimitRecord {
  count: number;
  timestamp: number;
}

// In-memory rate limiting (consider using Redis in production)
const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return false;
  }

  // Reset if window has passed
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return false;
  }

  // Check if limit exceeded
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  // Increment count
  record.count++;
  return false;
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(Deno.env.get('JWT_SECRET'));
    const payload = await verify(token, key);
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    // Check if token has been revoked
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: revokedToken } = await supabaseClient
      .from('revoked_tokens')
      .select('id')
      .eq('token', token)
      .single();

    return !revokedToken;
  } catch {
    return false;
  }
}

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

    // Get the user ID from the request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check rate limiting
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Get the user's email from the auth.users table
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Create a JWT token with the user's email
    const key = new TextEncoder().encode(Deno.env.get('JWT_SECRET'));
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      email: userData.email,
      userId: userId,
      iat: now,
      exp: now + 3600, // Token expires in 1 hour
      jti: crypto.randomUUID(), // Unique token ID
    };

    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

    // Store token metadata in database for audit trail
    const { error: tokenError } = await supabaseClient
      .from('token_metadata')
      .insert({
        token_id: payload.jti,
        user_id: userId,
        created_at: new Date().toISOString(),
        expires_at: new Date((now + 3600) * 1000).toISOString(),
      });

    if (tokenError) throw tokenError;

    // Return the token
    return new Response(
      JSON.stringify({ 
        token,
        expiresIn: 3600,
        tokenId: payload.jti
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