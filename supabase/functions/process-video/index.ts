
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessVideoRequest {
  videoId: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
  bitrate?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { videoId }: ProcessVideoRequest = await req.json();

    if (!videoId) {
      throw new Error("Video ID is required");
    }

    console.log(`Processing video with ID: ${videoId}`);

    // 1. Get the video information from the database
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !videoData) {
      throw new Error(`Error fetching video: ${videoError?.message || "Video not found"}`);
    }

    console.log(`Retrieved video: ${videoData.title}, URL: ${videoData.video_url}`);

    // 2. Download the video file for processing
    const videoPath = videoData.video_url.replace('videos/', '');
    console.log(`Downloading video from storage path: ${videoPath}`);
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('videos')
      .download(videoPath);
      
    if (downloadError || !fileData) {
      throw new Error(`Error downloading video: ${downloadError?.message || "Download failed"}`);
    }
    
    console.log(`Video downloaded successfully, size: ${fileData.size} bytes`);

    // 3. Extract metadata from the video file
    // In a real implementation, we would use a video processing library
    // Here we'll simulate metadata extraction
    const metadata = await extractVideoMetadata(fileData);
    console.log("Extracted metadata:", metadata);

    // 4. Generate thumbnail
    const thumbnailUrl = await generateThumbnail(supabase, videoId, fileData);
    console.log(`Generated thumbnail: ${thumbnailUrl}`);

    // 5. Update the video status and metadata in the database
    const { error: updateError } = await supabase
      .from('videos')
      .update({ 
        status: 'ready',
        duration: metadata.duration,
        thumbnail_url: thumbnailUrl
      })
      .eq('id', videoId);

    if (updateError) {
      throw new Error(`Error updating video status: ${updateError.message}`);
    }

    console.log(`Video ${videoId} processing completed and marked as ready`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video processed successfully",
        videoId,
        metadata,
        thumbnailUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing video:", error.message);
    
    // If we have a video ID, update its status to failed
    try {
      const { videoId } = await req.json();
      if (videoId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('videos')
          .update({ status: 'failed' })
          .eq('id', videoId);
        
        console.log(`Updated video ${videoId} status to failed`);
      }
    } catch (updateError) {
      console.error("Error updating video status to failed:", updateError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Extract metadata from a video file
 * In a production environment, you would use a video processing library like FFmpeg
 */
async function extractVideoMetadata(videoFile: Blob): Promise<VideoMetadata> {
  // Simulate metadata extraction by analyzing the first few bytes of the file
  // In real implementation, you would use a library like FFprobe/FFmpeg
  
  // For demonstration purposes, we'll parse the video file header 
  // to determine if it's an MP4 file and extract basic information
  const buffer = await videoFile.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 32)); // First 32 bytes
  
  let format = "unknown";
  
  // Check for MP4 signature (ftyp)
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    format = "mp4";
  }
  // Check for WebM signature (0x1A 0x45 0xDF 0xA3)
  else if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
    format = "webm";
  }
  
  // Calculate a deterministic but random-looking duration based on file size
  // In a real implementation, you would extract the actual duration
  const fileSizeInMB = videoFile.size / (1024 * 1024);
  const duration = Math.min(Math.max(Math.round(fileSizeInMB * 10), 30), 600); // Between 30s and 10min
  
  // Estimate resolution based on file size (just for simulation)
  let width = 1280;
  let height = 720;
  
  if (fileSizeInMB > 50) {
    width = 1920;
    height = 1080;
  } else if (fileSizeInMB < 10) {
    width = 854;
    height = 480;
  }
  
  // Estimate bitrate
  const bitrate = Math.round((videoFile.size * 8) / duration / 1000); // kbps
  
  return {
    duration,
    width,
    height,
    format,
    bitrate
  };
}

/**
 * Generate a thumbnail from the video
 * In a production environment, you would extract a frame from the video
 */
async function generateThumbnail(
  supabase: any,
  videoId: string,
  videoFile: Blob
): Promise<string> {
  try {
    // In a real implementation, you would extract a frame from the video
    // Here we're creating a simple colored canvas as a thumbnail
    const canvas = new OffscreenCanvas(640, 360);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 640, 360);
    
    // Generate a color based on the videoId for uniqueness
    const hash = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash + 180) % 360;
    
    gradient.addColorStop(0, `hsl(${hue1}, 70%, 50%)`);
    gradient.addColorStop(1, `hsl(${hue2}, 70%, 30%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 360);
    
    // Add a play button shape
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(270, 180);
    ctx.lineTo(390, 260);
    ctx.lineTo(270, 340);
    ctx.closePath();
    ctx.fill();
    
    // Convert canvas to blob
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    
    // Upload the thumbnail to Supabase storage
    const thumbnailPath = `thumbnails/${videoId}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(thumbnailPath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      throw new Error(`Error uploading thumbnail: ${uploadError.message}`);
    }
    
    // Get the public URL for the thumbnail
    const { data: urlData } = supabase
      .storage
      .from('videos')
      .getPublicUrl(thumbnailPath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    // Return a default thumbnail URL if generation fails
    return `${supabaseUrl}/storage/v1/object/public/videos/default-thumbnail.jpg`;
  }
}
