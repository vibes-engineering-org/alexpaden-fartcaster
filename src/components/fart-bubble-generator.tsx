"use client";

import React, { useRef, useCallback, createContext, useContext } from "react";

export type FartBubbleConfig = {
  profileImageUrl: string;
  username: string;
  currentUser: string;
  backgroundColor?: string;
};

type FartBubbleContextType = {
  generateImage: (config: FartBubbleConfig) => Promise<string>;
};

const FartBubbleContext = createContext<FartBubbleContextType | null>(null);

export function useFartBubbleGenerator() {
  const context = useContext(FartBubbleContext);
  if (!context) {
    throw new Error("useFartBubbleGenerator must be used within FartBubbleProvider");
  }
  return context;
}

export function FartBubbleProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = useCallback(async (config: FartBubbleConfig): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("Canvas not initialized"));
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Set canvas size for mobile (square format, good for sharing)
      canvas.width = 500;
      canvas.height = 500;

      // Create soft gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#f8fafc"); // Very light gray-blue
      gradient.addColorStop(0.5, "#f1f5f9"); // Slightly darker
      gradient.addColorStop(1, "#e2e8f0"); // Light gray
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw profile image
      const profileImg = new Image();
      profileImg.crossOrigin = "anonymous";
      
      profileImg.onload = () => {
        try {
          // Draw profile picture (centered, with some padding)
          const profileSize = 180;
          const profileX = (canvas.width - profileSize) / 2;
          const profileY = (canvas.height - profileSize) / 2 - 40; // Slightly above center

          // Draw circular profile picture
          ctx.save();
          ctx.beginPath();
          ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(profileImg, profileX, profileY, profileSize, profileSize);
          ctx.restore();

          // Draw fart bubble (green, to the right and slightly below profile)
          const bubbleX = profileX + profileSize - 20;
          const bubbleY = profileY + profileSize - 60;
          
          // Main bubble
          ctx.fillStyle = "#22c55e"; // Green-500
          ctx.strokeStyle = "#16a34a"; // Green-600
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(bubbleX + 40, bubbleY + 20, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Smaller bubbles trailing off
          ctx.fillStyle = "#22c55e";
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          
          // Medium bubble
          ctx.beginPath();
          ctx.arc(bubbleX + 80, bubbleY + 10, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Small bubble
          ctx.beginPath();
          ctx.arc(bubbleX + 100, bubbleY - 5, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Add text at bottom
          ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#64748b"; // Slate-500
          ctx.textAlign = "center";
          
          const text = `${config.currentUser} farted on ${config.username}`;
          const textY = canvas.height - 40;
          ctx.fillText(text, canvas.width / 2, textY);

          // Convert to data URL
          const dataURL = canvas.toDataURL("image/png", 0.9);
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };

      profileImg.onerror = () => {
        reject(new Error("Failed to load profile image"));
      };

      profileImg.src = config.profileImageUrl;
    });
  }, []);

  return (
    <FartBubbleContext.Provider value={{ generateImage }}>
      {children}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={500}
        height={500}
      />
    </FartBubbleContext.Provider>
  );
}

export function FartBubbleGenerator() {
  return null; // Component no longer needed as canvas is in provider
}