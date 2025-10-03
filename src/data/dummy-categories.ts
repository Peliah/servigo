import type { ServiceCategory } from "@/types";

export const DUMMY_CATEGORIES: ServiceCategory[] = [
  { category_id: "cat_plumbing", category_name: "Plumbing", description: "Pipes, leaks, fixtures", created_at: new Date() },
  { category_id: "cat_electrical", category_name: "Electrical", description: "Wiring, sockets, lighting", created_at: new Date() },
  { category_id: "cat_carpentry", category_name: "Carpentry", description: "Woodwork, doors, cabinets", created_at: new Date() },
];
