"use client";

import { useState } from "react";
import { Copy, Link2, MessageSquare, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./reaction-button";

interface ShareActionProps {
  postUrl: string;
  shareCount: number;
}

export function ShareAction({ postUrl, shareCount }: ShareActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* We wrap the existing ShareButton inside the Dialog trigger */}
        <div>
          <ShareButton shareCount={shareCount} />
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading">Share this post</DialogTitle>
          <DialogDescription>
            Spread the word by sharing this post with your friends.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl hover:bg-primary/10 border-border"
            onClick={handleCopy}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {copied ? (
                <Copy className="h-5 w-5 text-success animate-in zoom-in" />
              ) : (
                <Link2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="text-xs font-medium text-foreground">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl hover:bg-accent/10 border-border"
          >
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Direct Message
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl hover:bg-foreground/5 border-border"
          >
            <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center">
              <Globe className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Social Media
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
