"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string | undefined) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // In production, this would upload to Vercel Blob or similar service
      // For now, we'll create a local object URL
      const objectUrl = URL.createObjectURL(file)
      onChange(objectUrl)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (value) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
        <div className="aspect-video relative w-full">
          <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 h-10 w-10 shadow-lg"
          onClick={handleRemove}
          aria-label="Remove image"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="w-full rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/50"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-3 min-h-[180px]">
        <div className="h-14 w-14 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
          {isUploading ? (
            <Upload className="h-7 w-7 animate-pulse text-muted-foreground" />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground sm:text-base">
            {isUploading ? "Uploading..." : "Click to upload photo"}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">PNG, JPG up to 10MB</p>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
