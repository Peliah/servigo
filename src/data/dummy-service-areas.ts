import type { ServiceArea } from "@/schemas/location-schema";

export const DUMMY_SERVICE_AREAS: ServiceArea[] = [
    // Paul - Electrical (Douala, Yaounde)
    {
        area_id: "area_1",
        technician_id: "u_tech_1",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 15,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_2",
        technician_id: "u_tech_1",
        city: "Yaounde",
        region: "Centre",
        coordinates: { lat: 3.8480, lng: 11.5021 },
        radius_km: 20,
        is_active: true,
        created_at: new Date(),
    },

    // Marie - Plumbing (Douala, Buea, Limbe)
    {
        area_id: "area_3",
        technician_id: "u_tech_2",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 25,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_4",
        technician_id: "u_tech_2",
        city: "Buea",
        region: "Southwest",
        coordinates: { lat: 4.1534, lng: 9.2426 },
        radius_km: 15,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_5",
        technician_id: "u_tech_2",
        city: "Limbe",
        region: "Southwest",
        coordinates: { lat: 4.0164, lng: 9.2081 },
        radius_km: 12,
        is_active: true,
        created_at: new Date(),
    },

    // Jean - Carpentry (Bamenda, Buea)
    {
        area_id: "area_6",
        technician_id: "u_tech_3",
        city: "Bamenda",
        region: "Northwest",
        coordinates: { lat: 5.9597, lng: 10.1519 },
        radius_km: 20,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_7",
        technician_id: "u_tech_3",
        city: "Buea",
        region: "Southwest",
        coordinates: { lat: 4.1534, lng: 9.2426 },
        radius_km: 18,
        is_active: true,
        created_at: new Date(),
    },

    // Grace - Painting (Yaounde, Douala)
    {
        area_id: "area_8",
        technician_id: "u_tech_4",
        city: "Yaounde",
        region: "Centre",
        coordinates: { lat: 3.8480, lng: 11.5021 },
        radius_km: 30,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_9",
        technician_id: "u_tech_4",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 25,
        is_active: true,
        created_at: new Date(),
    },

    // Pierre - Automotive (Douala, Yaounde)
    {
        area_id: "area_10",
        technician_id: "u_tech_5",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 0, // Customer brings car to shop
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_11",
        technician_id: "u_tech_5",
        city: "Yaounde",
        region: "Centre",
        coordinates: { lat: 3.8480, lng: 11.5021 },
        radius_km: 0, // Customer brings car to shop
        is_active: true,
        created_at: new Date(),
    },

    // Sarah - Hair (Buea, Limbe)
    {
        area_id: "area_12",
        technician_id: "u_tech_6",
        city: "Buea",
        region: "Southwest",
        coordinates: { lat: 4.1534, lng: 9.2426 },
        radius_km: 0, // Salon-based service
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_13",
        technician_id: "u_tech_6",
        city: "Limbe",
        region: "Southwest",
        coordinates: { lat: 4.0164, lng: 9.2081 },
        radius_km: 0, // Salon-based service
        is_active: true,
        created_at: new Date(),
    },

    // Marc - Cleaning (Douala, Yaounde, Bamenda)
    {
        area_id: "area_14",
        technician_id: "u_tech_7",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 20,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_15",
        technician_id: "u_tech_7",
        city: "Yaounde",
        region: "Centre",
        coordinates: { lat: 3.8480, lng: 11.5021 },
        radius_km: 25,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_16",
        technician_id: "u_tech_7",
        city: "Bamenda",
        region: "Northwest",
        coordinates: { lat: 5.9597, lng: 10.1519 },
        radius_km: 15,
        is_active: true,
        created_at: new Date(),
    },

    // Alice - Landscaping (Buea, Limbe)
    {
        area_id: "area_17",
        technician_id: "u_tech_8",
        city: "Buea",
        region: "Southwest",
        coordinates: { lat: 4.1534, lng: 9.2426 },
        radius_km: 25,
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_18",
        technician_id: "u_tech_8",
        city: "Limbe",
        region: "Southwest",
        coordinates: { lat: 4.0164, lng: 9.2081 },
        radius_km: 20,
        is_active: true,
        created_at: new Date(),
    },

    // David - Technology (Douala, Yaounde, Bamenda)
    {
        area_id: "area_19",
        technician_id: "u_tech_9",
        city: "Douala",
        region: "Littoral",
        coordinates: { lat: 4.0483, lng: 9.7043 },
        radius_km: 0, // Shop-based service
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_20",
        technician_id: "u_tech_9",
        city: "Yaounde",
        region: "Centre",
        coordinates: { lat: 3.8480, lng: 11.5021 },
        radius_km: 0, // Shop-based service
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_21",
        technician_id: "u_tech_9",
        city: "Bamenda",
        region: "Northwest",
        coordinates: { lat: 5.9597, lng: 10.1519 },
        radius_km: 0, // Shop-based service
        is_active: true,
        created_at: new Date(),
    },

    // Rose - Beauty (Buea, Limbe)
    {
        area_id: "area_22",
        technician_id: "u_tech_10",
        city: "Buea",
        region: "Southwest",
        coordinates: { lat: 4.1534, lng: 9.2426 },
        radius_km: 0, // Salon-based service
        is_active: true,
        created_at: new Date(),
    },
    {
        area_id: "area_23",
        technician_id: "u_tech_10",
        city: "Limbe",
        region: "Southwest",
        coordinates: { lat: 4.0164, lng: 9.2081 },
        radius_km: 0, // Salon-based service
        is_active: true,
        created_at: new Date(),
    },
];
