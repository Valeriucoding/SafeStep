"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { CategorySelect } from "@/components/category-select"
import { Loader2 } from "lucide-react"
import type { NewIncident } from "@/types"

const reportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  imageUrl: z.string().optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportFormProps {
  onSubmit: (data: Omit<NewIncident, "location" | "userId">) => Promise<void>
  isSubmitting: boolean
  disabled?: boolean
}

export function ReportForm({ onSubmit, isSubmitting, disabled }: ReportFormProps) {
  const [imageUrl, setImageUrl] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  })

  const category = watch("category")

  const onFormSubmit = async (data: ReportFormData) => {
    await onSubmit({
      ...data,
      imageUrl,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <CategorySelect value={category} onChange={(value) => setValue("category", value)} />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Brief description of the incident" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about what happened..."
              rows={4}
              {...register("description")}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" placeholder="Street address or landmark" {...register("address")} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={disabled || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>

          {disabled && (
            <p className="text-sm text-center text-muted-foreground">Please select a location on the map above</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
