"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { getIncidentById, verifyIncident } from "@/lib/api"
import { IncidentDetail } from "@/components/incident-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Incident } from "@/types"

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasVerified, setHasVerified] = useState(false)

  useEffect(() => {
    async function loadIncident() {
      try {
        const data = await getIncidentById(id)
        setIncident(data)
      } catch (error) {
        console.error("Failed to load incident:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadIncident()
  }, [id])

  const handleVerify = async () => {
    if (!incident || hasVerified) return

    try {
      await verifyIncident(incident.id)
      setIncident({
        ...incident,
        verificationCount: incident.verificationCount + 1,
      })
      setHasVerified(true)
    } catch (error) {
      console.error("Failed to verify incident:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Incident not found</p>
        <Link href="/">
          <Button>Back to Map</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Incident Details</h1>
        </div>
      </header>

      {/* Content */}
      <IncidentDetail incident={incident} onVerify={handleVerify} hasVerified={hasVerified} />
    </div>
  )
}
