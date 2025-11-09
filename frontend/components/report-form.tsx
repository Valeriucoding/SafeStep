"use client"

import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { CategorySelect } from "@/components/category-select"
import { Loader2 } from "lucide-react"
import type { Category, NewEvent } from "@/types"

const CATEGORY_VALUES = ["danger", "blocked-path", "protest", "event", "crime-alert"] as const satisfies readonly Category[]

const reportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(CATEGORY_VALUES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  imageUrl: z.string().optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportFormProps {
  onSubmit: (data: Omit<NewEvent, "location">) => Promise<void>
  isSubmitting: boolean
  disabled?: boolean
  radiusMeters?: number
  isReportingBlocked?: boolean
  blockedReason?: string | null
}

export function ReportForm({
  onSubmit,
  isSubmitting,
  disabled,
  radiusMeters,
  isReportingBlocked,
  blockedReason,
}: ReportFormProps) {
  const [imageUrl, setImageUrl] = useState<string>()
  const baseId = useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const addressId = `${baseId}-address`

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
    if (isReportingBlocked) {
      return
    }

    await onSubmit({
      ...data,
      imageUrl,
      ...(radiusMeters && radiusMeters > 0 ? { radiusMeters } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Category Selection */}
      <div className="space-y-3">
        <Label htmlFor="category" className="text-base font-medium">Category *</Label>
        <CategorySelect value={category} onChange={(value) => setValue("category", value)} />
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div className="border-t border-border" />

      {/* Title */}
      <div className="space-y-3">
        <Label htmlFor={titleId} className="text-base font-medium">
          Title *
        </Label>
        <Input 
          id={titleId}
          placeholder="Brief description of the incident" 
          className="h-12 text-base"
          {...register("title")} 
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor={descriptionId} className="text-base font-medium">
          Description *
        </Label>
        <Textarea
          id={descriptionId}
          placeholder="Provide more details about what happened..."
          rows={5}
          className="text-base resize-none"
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Label htmlFor={addressId} className="text-base font-medium">
          Address *
        </Label>
        <Input 
          id={addressId}
          placeholder="Street address or landmark" 
          className="h-12 text-base"
          {...register("address")} 
        />
        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
      </div>

      <div className="border-t border-border" />

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Photo (Optional)</Label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      {/* Submit Button */}
      <div className="pt-4 space-y-3">
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          size="lg"
          disabled={disabled || isSubmitting || Boolean(isReportingBlocked)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
        {disabled && !isReportingBlocked && (
          <p className="text-sm text-center text-muted-foreground">Please select a location on the map above</p>
        )}
        {isReportingBlocked && (
          <p className="text-sm text-center text-destructive">
            {blockedReason ?? "Reporting is temporarily unavailable."}
          </p>
        )}
      </div>
    </form>
  )
}
