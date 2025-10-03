import type { Client, Technician, Admin } from "@/types";

export const DUMMY_CLIENTS: Client[] = [
  {
    user_id: "u_client_1",
    client_id: "u_client_1",
    email: "jane.client@example.com",
    password_hash: "hashed-password",
    first_name: "Jane",
    last_name: "Doe",
    phone_number: "+237600000001",
    profile_picture_url: null,
    date_created: new Date(),
    last_login: null,
    user_type: "client",
    is_active: true,
    email_verified_at: null,
    phone_verified_at: null,
    default_address: "Douala, Cameroon",
  },
];

export const DUMMY_TECHNICIANS: Technician[] = [
  {
    user_id: "u_tech_1",
    technician_id: "u_tech_1",
    email: "paul.tech@example.com",
    password_hash: "hashed-password",
    first_name: "Paul",
    last_name: "Ndi",
    phone_number: "+237600000101",
    profile_picture_url: null,
    date_created: new Date(),
    last_login: null,
    user_type: "technician",
    is_active: true,
    email_verified_at: null,
    phone_verified_at: null,
    business_name: "Ndi Electricals",
    bio: "Certified electrician with 7 years experience",
    years_of_experience: 7,
    identity_verified: true,
    is_available: true,
  },
];

export const DUMMY_ADMINS: Admin[] = [
  {
    user_id: "u_admin_1",
    admin_id: "u_admin_1",
    email: "admin@example.com",
    password_hash: "hashed-password",
    first_name: "Ava",
    last_name: "Mbarga",
    phone_number: "+237600009999",
    profile_picture_url: null,
    date_created: new Date(),
    last_login: null,
    user_type: "admin",
    is_active: true,
    email_verified_at: null,
    phone_verified_at: null,
    admin_role: "support",
  },
];
