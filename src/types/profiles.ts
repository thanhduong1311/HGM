import { Database } from "@/types/database.types";

export type Tables = Database["public"]["Tables"];
export type Profiles = Tables["profiles"];
export type ProfileInsert = Profiles["Insert"];

export function buildProfileData(data: {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
}): ProfileInsert {
  const timestamp = new Date().toISOString();
  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    full_name: data.fullName,
    created_at: timestamp,
    updated_at: timestamp,
  };
}
