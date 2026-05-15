import { supabase } from "../lib/supabase";
import type {
  GuestbookEntry,
  GuestbookInsertPayload,
} from "../types/guestbook";

export async function listGuestbookEntries(): Promise<GuestbookEntry[]> {
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guestbook entries:", error);
    return [];
  }

  return data || [];
}

export async function insertGuestbookEntry(
  payload: GuestbookInsertPayload
): Promise<GuestbookEntry | null> {
  const { data, error } = await supabase
    .from("guestbook")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error inserting guestbook entry:", error);
    return null;
  }

  return data;
}
