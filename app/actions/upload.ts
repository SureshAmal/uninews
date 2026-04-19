"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getCurrentUser } from "@/lib/auth/session";

export async function uploadFile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // Validate file type
  const allowedTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  const ext = allowedTypes[file.type];
  if (!ext) {
    return { error: "File type not allowed" };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large (max 10MB)" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename using validated extension (not user-provided)
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  // Upload to Supabase Storage securely, bypassing RLS using the admin key
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.storage
    .from("news")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return { error: "Failed to upload file to cloud storage" };
  }

  // Get public URL
  const { data: publicData } = supabase.storage
    .from("news")
    .getPublicUrl(filename);

  const type = file.type.startsWith("video/") ? "video" : "image";
  return { url: publicData.publicUrl, type };
}
