"use server"

import type { Incident, NewIncident } from "@/types"

// Mock data for development
const mockIncidents: Incident[] = [
  {
    id: "1",
    title: "Road Closed",
    description: "Construction work blocking main street",
    category: "blocked-path",
    location: { lat: 44.4268, lng: 26.1025 },
    address: "Piata Unirii, Bucharest, Romania",
    createdAt: new Date("2025-01-08"),
    userId: "user1",
    imageUrl: "/road-construction.png",
    verificationCount: 5,
    isActive: true,
  },
  {
    id: "2",
    title: "Protest March",
    description: "Peaceful protest on 5th Avenue",
    category: "protest",
    location: { lat: 44.4353, lng: 26.1027 },
    address: "Calea Victoriei, Bucharest, Romania",
    createdAt: new Date("2025-01-08"),
    userId: "user2",
    verificationCount: 12,
    isActive: true,
  },
  {
    id: "3",
    title: "Suspicious Activity",
    description: "Report of suspicious person in the area",
    category: "crime-alert",
    location: { lat: 44.4406, lng: 26.045 },
    address: "Strada Paris, Bucharest, Romania",
    createdAt: new Date("2025-01-08"),
    userId: "user3",
    verificationCount: 3,
    isActive: true,
  },
]

export async function getAllIncidents(): Promise<Incident[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockIncidents
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockIncidents.find((incident) => incident.id === id) || null
}

export async function createIncident(incident: NewIncident): Promise<Incident> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newIncident: Incident = {
    ...incident,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    verificationCount: 0,
    isActive: true,
  }

  mockIncidents.push(newIncident)
  return newIncident
}

export async function verifyIncident(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const incident = mockIncidents.find((i) => i.id === id)
  if (incident) {
    incident.verificationCount += 1
  }
}
