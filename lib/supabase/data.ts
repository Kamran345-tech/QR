import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type BeatRecord = {
  id: string;
  beat: string;
  uc: string;
  tehsil: string;
  district: string;
  status: "Active" | "Inactive";
  mapUrl: string;
  vehicle: string;
  tmId: string;
  fmoId: string;
  supervisorId: string;
  workers: Array<{
    id: string;
    name: string;
    photo: string;
    designation: string;
    shift: string;
    attendance: string;
  }>;
  updatedAt: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  phone: string;
  role: "TM" | "FMO" | "Supervisor";
};

export type ComplaintRecord = {
  id: string;
  beat: string;
  category: string;
  name: string;
  mobile: string;
  comments: string;
  createdAt: string;
};

export async function loadOfficeData() {
  const supabase = getSupabaseBrowserClient();
  const [beatResult, contactResult, complaintResult] = await Promise.all([
    supabase.from("beats").select("*, beat_workers(*)").order("created_at", { ascending: false }),
    supabase.from("office_contacts").select("*").eq("is_active", true).order("full_name"),
    supabase.from("complaints").select("*").order("created_at", { ascending: false }),
  ]);

  if (beatResult.error) throw beatResult.error;
  if (contactResult.error) throw contactResult.error;
  if (complaintResult.error) throw complaintResult.error;

  const beats: BeatRecord[] = (beatResult.data || []).map((row: any) => ({
    id: row.id,
    beat: row.beat_number,
    uc: row.union_council,
    tehsil: row.tehsil,
    district: row.district,
    status: row.status,
    mapUrl: row.map_url || "",
    vehicle: row.assigned_vehicle || "",
    tmId: row.tm_contact_id || "",
    fmoId: row.fmo_contact_id || "",
    supervisorId: row.supervisor_contact_id || "",
    updatedAt: row.updated_at,
    workers: (row.beat_workers || []).map((worker: any) => ({
      id: worker.id,
      name: worker.full_name,
      photo: worker.photo_url || "",
      designation: worker.designation,
      shift: worker.shift,
      attendance: worker.attendance_time || "",
    })),
  }));

  const contacts: ContactRecord[] = (contactResult.data || []).map((row: any) => ({
    id: row.id,
    name: row.full_name,
    phone: row.phone,
    role: row.role,
  }));

  const complaints: ComplaintRecord[] = (complaintResult.data || []).map((row: any) => ({
    id: row.id,
    beat: row.beat_number,
    category: row.category,
    name: row.citizen_name,
    mobile: row.mobile,
    comments: row.comments || "",
    createdAt: row.created_at,
  }));

  return { beats, contacts, complaints };
}

export async function saveBeatRecord(beat: BeatRecord) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("beats").upsert({
    id: beat.id,
    beat_number: beat.beat,
    union_council: beat.uc,
    tehsil: beat.tehsil,
    district: beat.district,
    status: beat.status,
    map_url: beat.mapUrl || null,
    assigned_vehicle: beat.vehicle || null,
    tm_contact_id: beat.tmId || null,
    fmo_contact_id: beat.fmoId || null,
    supervisor_contact_id: beat.supervisorId || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  const { error: deleteError } = await supabase.from("beat_workers").delete().eq("beat_id", beat.id);
  if (deleteError) throw deleteError;

  if (beat.workers.length) {
    const { error: workerError } = await supabase.from("beat_workers").insert(
      beat.workers.map((worker, index) => ({
        id: worker.id,
        beat_id: beat.id,
        full_name: worker.name,
        photo_url: worker.photo || null,
        designation: worker.designation,
        shift: worker.shift,
        attendance_time: worker.attendance || null,
        sort_order: index,
      }))
    );
    if (workerError) throw workerError;
  }
}

export async function saveContactRecord(contact: ContactRecord) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("office_contacts").upsert({
    id: contact.id,
    full_name: contact.name,
    phone: contact.phone,
    role: contact.role,
    is_active: true,
  });
  if (error) throw error;
}

export async function saveComplaintRecord(complaint: ComplaintRecord, beatId?: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("complaints").insert({
    id: complaint.id,
    beat_id: beatId || null,
    beat_number: complaint.beat,
    category: complaint.category,
    citizen_name: complaint.name,
    mobile: complaint.mobile,
    comments: complaint.comments || null,
  });
  if (error) throw error;
}
