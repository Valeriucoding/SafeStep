"use server"

import type { Event, NewEvent } from "@/types"

// Mock data for development
const mockEvents: Event[] = [
    {
        id: "1",
        title: "Road Closed",
        description: "Construction work blocking main street",
        category: "blocked-path",
        location: { lat: 44.4268, lng: 26.1025 },
        address: "Piata Unirii, Bucharest, Romania",
        createdAt: "2025-01-08T00:00:00Z",
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
        createdAt: "2025-01-08T00:00:00Z",
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
        createdAt: "2025-01-08T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
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
        createdAt: "2025-01-09T00:00:00Z",
        verificationCount: 4,
        isActive: true,
        radiusMeters: 100,
    },
]

export async function getAllEvents(): Promise<Event[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockEvents
}

export async function getEventById(id: string): Promise<Event | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockEvents.find((event) => event.id === id) || null
}

export async function createEvent(event: NewEvent): Promise<Event> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newEvent: Event = {
        ...event,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        verificationCount: 0,
        isActive: true,
    }

    mockEvents.push(newEvent)
    return newEvent
}

export async function verifyEvent(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const event = mockEvents.find((i) => i.id === id)
    if (event) {
        event.verificationCount += 1
    }
}
