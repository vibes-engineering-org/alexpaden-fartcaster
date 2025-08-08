"use client";

export type FartBubbleConfig = {
  profileImageUrl: string;
  username: string;
  currentUser: string;
  backgroundColor?: string;
};

// Helper function to load an image with Promise
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log(`✅ Image loaded successfully: ${src}`);
      resolve(img);
    };
    
    img.onerror = () => {
      console.error(`❌ Failed to load image: ${src}`);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

export async function generateFartBubbleImage(config: FartBubbleConfig): Promise<string> {
  console.log("🎨 Starting fart bubble generation...");
  
  try {
    // Step 1: Create canvas
    console.log("📐 Creating canvas with dimensions 500x500");
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not available");
    }

    // Step 2: Draw white background
    console.log("⚪ Drawing white background");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log("✅ White background drawn");

    // Step 3: Load profile image sequentially
    console.log("🖼️ Loading profile image...");
    const profileImg = await loadImage(config.profileImageUrl);

    // Step 4: Load stink cloud image (with error handling)
    console.log("☁️ Loading stink cloud image...");
    let stinkCloudImg: HTMLImageElement | null = null;
    try {
      stinkCloudImg = await loadImage("/images/stink-cloud.png");
    } catch (error) {
      console.warn("⚠️ Stink cloud failed to load, continuing without it:", error);
    }

    // Step 5: Draw profile image (clipped to circle) FIRST
    console.log("🎭 Drawing circular profile image");
    const profileSize = 180;
    const profileX = (canvas.width - profileSize) / 2;
    const profileY = (canvas.height - profileSize) / 2 - 40;

    // Add subtle shadow for depth
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(profileImg, profileX, profileY, profileSize, profileSize);
    ctx.restore();
    
    // Add subtle border for definition
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
    ctx.stroke();
    
    console.log("✅ Profile image drawn with border");

    // Step 6: Draw stink cloud ON TOP of profile (if loaded)
    if (stinkCloudImg) {
      console.log("💨 Drawing stink cloud in front of profile");
      console.log(`Stink cloud original dimensions: ${stinkCloudImg.width}x${stinkCloudImg.height}`);
      
      // Preserve aspect ratio of the original image
      const aspectRatio = stinkCloudImg.width / stinkCloudImg.height;
      const cloudHeight = profileSize * 0.9; // Larger but not overwhelming
      const cloudWidth = cloudHeight * aspectRatio;
      
      // Position cloud at bottom-left, extending outward
      const cloudX = profileX - cloudWidth * 0.6; // Start from left edge
      const cloudY = profileY + profileSize * 0.5; // Start from middle-bottom of profile
      
      // Set image smoothing to prevent pixelation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Add slight rotation for dynamic effect
      ctx.save();
      ctx.translate(cloudX + cloudWidth/2, cloudY + cloudHeight/2);
      ctx.rotate(-2 * Math.PI / 180); // Subtle angle
      ctx.drawImage(stinkCloudImg, -cloudWidth/2, -cloudHeight/2, cloudWidth, cloudHeight);
      ctx.restore();
      
      console.log(`✅ Stink cloud drawn at ${cloudWidth}x${cloudHeight}`);
    }

    // Step 7: Text overlay removed for simplicity
    console.log("📝 Text overlay skipped (removed for simplicity)");

    // Step 8: Convert to JPEG
    console.log("📸 Converting canvas to JPEG...");
    const dataURL = canvas.toDataURL("image/jpeg", 0.95);
    console.log("✅ Successfully converted to JPEG");
    console.log(`📊 Data URL length: ${dataURL.length} characters`);
    console.log(`🔍 Data URL preview: ${dataURL.substring(0, 50)}...`);
    
    console.log("🎉 Fart bubble generation complete!");
    return dataURL;

  } catch (error) {
    console.error("💥 Error generating fart bubble:", error);
    throw error;
  }
}