"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/users";
import { uploadFile } from "@/app/actions/upload";
import { Camera, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { BackButton } from "@/components/layout/back-button";

interface EditFormProps {
  user: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

export function EditForm({ user }: EditFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploading, startUpload] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.success) setSaved(true);
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File too large", "File exceeds the 10MB limit. Please upload a smaller file.");
      return;
    }
    startUpload(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadFile(fd);
      if (result.url) {
        setAvatarUrl(result.url);
      } else if (result.error) {
        toast.error("Upload failed", result.error);
      }
    });
  };

  return (
    <div>
      <BackButton />
      <form action={handleSubmit}>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              className="avatar avatar-xl"
              style={{
                border: "2px solid var(--border-color)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: "var(--bg-tertiary)",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Camera size={32} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--text-tertiary)" }} />
              )}
            </div>
            <div>
              <label
                className="btn btn-secondary btn-sm"
                style={{ cursor: "pointer" }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                />
                {uploading ? "Uploading..." : "Change Avatar"}
              </label>
            </div>
          </div>
          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          <div className="input-group">
            <label htmlFor="displayName" className="input-label">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio" className="input-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              className="input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              style={{ minHeight: 100 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isPending}
            style={{ width: "100%" }}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>

          {saved && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--success)",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem"
              }}
            >
              <CheckCircle size={16} /> Profile updated!
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
