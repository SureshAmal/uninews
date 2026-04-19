import { getActiveAnnouncement, createAnnouncement, deactivateAnnouncement } from "@/app/actions/admin";
import { Megaphone, XCircle, Bell, History } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminAnnouncementsPage() {
  const activeAnnouncement = await getActiveAnnouncement();

  async function handleCreate(formData: FormData) {
    "use server";
    const msg = formData.get("message") as string;
    if (msg) {
      await createAnnouncement(msg);
      revalidatePath("/admin/announcements");
    }
  }

  async function handleDeactivate() {
    "use server";
    await deactivateAnnouncement();
    revalidatePath("/admin/announcements");
  }

  return (
    <div className="admin-page-container animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="headline-medium m-0">Announcements</h1>
          <p className="text-secondary m-0 text-sm">Broadcast global messages to all active users</p>
        </div>
      </div>

      <div className="admin-grid">
        {/* Create Card */}
        <div className="card admin-card-padded">
          <div className="flex items-center gap-2 mb-6">
            <Megaphone size={18} className="text-accent" />
            <h2 className="admin-sidebar-title text-base">New Broadcast</h2>
          </div>
          
          <form action={handleCreate} className="admin-form-group">
            <div className="input-group m-0">
              <label className="input-label">Message</label>
              <textarea
                name="message"
                className="input min-h-[120px] resize-none"
                placeholder="Type your announcement here... (e.g. Scheduled maintenance, new feature release)"
                required
              />
              <p className="text-[0.7rem] text-tertiary mt-2">
                This message will appear at the top of the homepage for all users.
              </p>
            </div>
            <button type="submit" className="btn btn-primary w-fit px-8 h-11">
              Broadcast Now
            </button>
          </form>
        </div>

        {/* Current State Card */}
        <div className="card admin-card-padded">
          <div className="flex items-center gap-2 mb-6">
            <History size={18} className="text-secondary" />
            <h2 className="admin-sidebar-title text-base">Active Broadcast</h2>
          </div>

          {activeAnnouncement ? (
            <div className="admin-alert-warning border-dashed border-2">
              <p className="m-0 mb-4 text-primary font-bold leading-relaxed">
                "{activeAnnouncement.message}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border-color">
                <p className="text-[0.75rem] text-tertiary m-0">
                  Raised {new Date(activeAnnouncement.createdAt).toLocaleString()}
                </p>
                <form action={handleDeactivate}>
                  <button type="submit" className="btn btn-sm btn-ghost text-error hover:bg-red-50 dark:hover:bg-red-950/20">
                    <XCircle size={14} className="mr-1" /> Stop
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="admin-empty-hero h-full flex flex-col items-center justify-center min-h-[200px]">
              <Megaphone size={32} className="text-divider mb-3 opacity-20" />
              <div>No active broadcast.</div>
              <p className="text-[0.8125rem] text-tertiary mt-1">Select a message on the left to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
