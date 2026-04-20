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
      try {
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadFile(fd);
        if (result.url) {
          setAvatarUrl(result.url);
        } else if (result.error) {
          toast.error("Upload failed", result.error);
        }
      } catch (err) {
        toast.error("Upload failed", "File may be too large or server errored.");
      }
    });
  };

  return (
    <div>
      <BackButton />
      <form action={handleSubmit}>
        <div className="grid gap-5 mt-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="avatar avatar-xl border-2 border-divider cursor-pointer relative overflow-hidden bg-bg-tertiary">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Camera size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-tertiary" />
              )}
            </div>
            <div>
              <label className="btn btn-secondary btn-sm cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
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
              className="input min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full mt-2"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>

          {saved && (
            <p className="text-[0.875rem] text-success text-center flex items-center justify-center gap-1.5">
              <CheckCircle size={16} /> Profile updated!
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
