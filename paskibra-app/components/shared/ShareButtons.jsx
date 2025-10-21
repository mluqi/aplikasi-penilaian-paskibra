"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Twitter, Facebook, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom WhatsApp icon component
const WhatsAppIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export default function ShareButtons({ title }) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Ensure this runs only on the client
    setCurrentUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        toast.success("Tautan berhasil disalin!");
      },
      (err) => {
        toast.error("Gagal menyalin tautan.");
        console.error("Could not copy text: ", err);
      }
    );
  };

  if (!currentUrl) {
    return null; // Don't render on the server or before URL is available
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild
        aria-label="Bagikan ke WhatsApp"
      >
        <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        aria-label="Bagikan ke Twitter"
      >
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        aria-label="Bagikan ke Facebook"
      >
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        aria-label="Salin tautan"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
