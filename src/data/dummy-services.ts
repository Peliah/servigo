import type { TechnicianService, WorkingHours } from "@/types";

export const DUMMY_SERVICES: TechnicianService[] = [
  {
    service_id: "svc_1",
    technician_id: "u_tech_1",
    category_id: "cat_electrical",
    service_title: "Socket Installation",
    service_description: "Install and test new power sockets",
    base_service_fee_estimate: 15000,
    transport_fee: 1500,
    is_active: true,
    created_at: new Date(),
  },
];

export const DUMMY_WORKING_HOURS: WorkingHours[] = [
  {
    hours_id: "wh_1",
    technician_id: "u_tech_1",
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
  },
  {
    hours_id: "wh_2",
    technician_id: "u_tech_1",
    day_of_week: 2,
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
  },
];
