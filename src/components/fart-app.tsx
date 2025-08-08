"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { generateFartBubbleImage } from "~/components/fart-bubble-generator";
import { ShareCastButton } from "~/components/share-cast-button";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";
import { Search, Download, Zap } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

export type FarcasterUser = {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  power_badge?: boolean;
};

export function FartApp() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<FarcasterUser | null>(null);
  const [error, setError] = useState("");
  
  const { context, isSDKLoaded } = useMiniAppSdk();
  const { toast } = useToast();

  // Get current user from Farcaster context
  const currentUser = context?.user?.displayName || context?.user?.username || "Someone";

  const searchUser = async (searchUsername: string): Promise<FarcasterUser | null> => {
    try {
      const response = await fetch(
        `/api/search-user?username=${encodeURIComponent(searchUsername)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to search user: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error searching user:", error);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedImageUrl(null);

    try {
      // Search for the user
      const user = await searchUser(username.trim());
      if (!user) {
        setError("User not found. Please check the username and try again.");
        return;
      }

      setTargetUser(user);

      // Generate the fart bubble image
      const imageUrl = await generateFartBubbleImage({
        profileImageUrl: user.pfp_url,
        username: user.username, // Use username directly, not display_name
        currentUser: currentUser,
      });

      setGeneratedImageUrl(imageUrl);
      toast({
        title: "Fart bubble generated!",
        description: `Successfully farted on @${user.username}`,
      });

    } catch (error) {
      console.error("Error generating fart bubble:", error);
      setError(error instanceof Error ? error.message : "Failed to generate fart bubble");
      toast({
        title: "Error",
        description: "Failed to generate fart bubble. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement("a");
    link.download = `fart-on-${targetUser?.username || username}.jpg`;
    link.href = generatedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Fart bubble image saved to your device",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fart Bubbles
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a fart bubble to your friend&apos;s profile picture
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Farcaster username..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyPress}
            className={error ? "border-red-500" : ""}
            disabled={loading}
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || !username.trim() || !isSDKLoaded}
            size="default"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Fart
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            {error}
          </div>
        )}
      </div>

      {/* Generated Image Section */}
      {generatedImageUrl && targetUser && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <img
              src={generatedImageUrl}
              alt={`Fart bubble on ${targetUser.display_name || targetUser.username}`}
              className="w-full rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <ShareCastButton
              text={`Just farted on @${targetUser.username}!`}
              url={generatedImageUrl}
              className="flex-1"
            />
          </div>

        </div>
      )}
    </div>
  );
}