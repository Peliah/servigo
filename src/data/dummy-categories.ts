import type { ServiceCategory } from "@/types";

export const DUMMY_CATEGORIES: ServiceCategory[] = [
  { category_id: "cat_plumbing", category_name: "Plumbing", description: "Pipes, leaks, fixtures", created_at: new Date() },
  { category_id: "cat_electrical", category_name: "Electrical", description: "Wiring, sockets, lighting", created_at: new Date() },
  { category_id: "cat_carpentry", category_name: "Carpentry", description: "Woodwork, doors, cabinets", created_at: new Date() },
  { category_id: "cat_painting", category_name: "Painting", description: "Interior and exterior painting", created_at: new Date() },
  { category_id: "cat_automotive", category_name: "Automotive", description: "Car repair and maintenance", created_at: new Date() },
  { category_id: "cat_beauty", category_name: "Beauty & Hair", description: "Hair styling, beauty treatments", created_at: new Date() },
  { category_id: "cat_cleaning", category_name: "Cleaning", description: "Residential and commercial cleaning", created_at: new Date() },
  { category_id: "cat_landscaping", category_name: "Landscaping", description: "Garden design and maintenance", created_at: new Date() },
  { category_id: "cat_technology", category_name: "Technology", description: "Computer and electronics repair", created_at: new Date() },
];
