"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Camera } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  onRemove: () => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  placeholder,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload - in real app, upload to your storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {value ? (
          <>
            <div className="relative w-16 h-16 rounded-md overflow-hidden border">
              <Image
                src={value || "/placeholder.jpg"}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={triggerFileSelect}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon" onClick={handleRemove}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="flex-1 h-20 border-dashed"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isUploading
                  ? "Uploading..."
                  : placeholder || "Click to upload image"}
              </span>
            </div>
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF. Max size: 5MB
      </p>
    </div>
  );
}
