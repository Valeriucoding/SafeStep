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
    radiusMeters: 150,
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
    radiusMeters: 250,
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
  {
    id: "4",
    title: "Street Performers Festival",
    description: "Live music and performers along the Lipscani pedestrian area",
    category: "event",
    location: { lat: 44.4314, lng: 26.0993 },
    address: "Strada Lipscani, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user4",
    imageUrl: "/street-performers-crowd.jpg",
    verificationCount: 8,
    isActive: true,
    radiusMeters: 180,
  },
  {
    id: "5",
    title: "Fallen Tree Blocking Sidewalk",
    description: "Large tree blocking pedestrian access near Cismigiu Gardens",
    category: "blocked-path",
    location: { lat: 44.4358, lng: 26.0961 },
    address: "Bulevardul Regina Elisabeta, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user5",
    imageUrl: "/broken-glass-on-sidewalk.jpg",
    verificationCount: 4,
    isActive: true,
    radiusMeters: 90,
  },
  {
    id: "6",
    title: "Emergency Utility Repairs",
    description: "Utility crews repairing underground cables, expect localized outages",
    category: "danger",
    location: { lat: 44.4302, lng: 26.1062 },
    address: "Piata Universitatii, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user6",
    verificationCount: 6,
    isActive: true,
    radiusMeters: 120,
  },
  {
    id: "7",
    title: "Night Cycling Group",
    description: "Organized cycling group passing through Victory Avenue",
    category: "event",
    location: { lat: 44.4373, lng: 26.0987 },
    address: "Calea Victoriei, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user7",
    imageUrl: "/peaceful-street-protest.jpg",
    verificationCount: 2,
    isActive: true,
    radiusMeters: 150,
  },
  {
    id: "8",
    title: "Night Market Setup",
    description: "Vendors preparing pop-up stalls along the Old Town fringe",
    category: "event",
    location: { lat: 44.4441, lng: 26.0972 },
    address: "Strada Franceza, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user8",
    imageUrl: "/street-performers-crowd.jpg",
    verificationCount: 5,
    isActive: true,
    radiusMeters: 130,
  },
  {
    id: "9",
    title: "Temporary Lane Closure",
    description: "Road crew repainting crosswalks, expect narrowed traffic lanes",
    category: "blocked-path",
    location: { lat: 44.4249, lng: 26.1098 },
    address: "Bulevardul Dimitrie Cantemir, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user9",
    verificationCount: 3,
    isActive: true,
    radiusMeters: 110,
  },
  {
    id: "10",
    title: "Police Checkpoint",
    description: "Routine checkpoint impacting traffic flow around Eroilor Boulevard",
    category: "danger",
    location: { lat: 44.4346, lng: 26.0843 },
    address: "Bulevardul Eroilor, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user10",
    verificationCount: 7,
    isActive: true,
    radiusMeters: 160,
  },
  {
    id: "11",
    title: "Community Watch Report",
    description: "Residents noted suspicious parked van near school entrance",
    category: "crime-alert",
    location: { lat: 44.4287, lng: 26.0896 },
    address: "Strada Izvor, Bucharest, Romania",
    createdAt: new Date("2025-01-09"),
    userId: "user11",
    verificationCount: 4,
    isActive: true,
    radiusMeters: 100,
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
