"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
      <Card className="relative overflow-hidden">
        <div className="aspect-video relative">
          <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    )
  }

  return (
    <Card
      className="border-dashed cursor-pointer hover:border-primary transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="p-8 flex flex-col items-center justify-center gap-2">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          {isUploading ? (
            <Upload className="h-6 w-6 animate-pulse text-muted-foreground" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload photo"}</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </Card>
  )
}
