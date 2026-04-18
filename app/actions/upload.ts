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
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: "File type not allowed" };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large (max 10MB)" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create upload directory
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const type = file.type.startsWith("video/") ? "video" : "image";
  return { url: `/uploads/${filename}`, type };
}
