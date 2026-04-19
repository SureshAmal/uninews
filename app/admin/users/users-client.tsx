"use client";

import { Search, ShieldAlert, ShieldCheck, MoreVertical, Edit2, KeyRound, Trash2, Shield, X, Filter, ChevronUp, ChevronDown, Camera } from "lucide-react";
import { toggleUserSuspension, adminDeleteUser, adminSetRole, adminResetPassword, adminUpdateUser } from "@/app/actions/admin";
import { uploadFile } from "@/app/actions/upload";
import { toast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Image from "next/image";
import Link from "next/link";

export function AdminUsersClient({ data, search, role, status, page, sortBy, sortOrder }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters("search", debouncedSearch);
    }
  }, [debouncedSearch]);

  const updateFilters = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value && value !== "all") current.set(key, value);
    else current.delete(key);
    current.delete("page");
    router.push(`?${current.toString()}`);
  };

  const handleSort = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (sortBy === key) {
      current.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      current.set("sortBy", key);
      current.set("sortOrder", "asc");
    }
    router.push(`?${current.toString()}`);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return null;
    return sortOrder === "asc" ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === data.users.length && data.users.length > 0) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(data.users.map((u: any) => u.id)));
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you SURE? This will permanently delete ${selectedUsers.size} users and ALL their posts!`)) return;
    for (const id of Array.from(selectedUsers)) {
      await adminDeleteUser(id);
    }
    toast.success("Bulk Delete", "Users successfully deleted.");
    setSelectedUsers(new Set());
  };

  const handleToggleSuspension = async (id: string) => {
    const res = await toggleUserSuspension(id);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Updated", "User suspension toggled.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you SURE?`)) return;
    const res = await adminDeleteUser(id);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Deleted", "User has been permanently deleted.");
  };

  const handleToggleRole = async (id: string, currentAdminStatus: boolean) => {
    if (!confirm(`Confirm role change?`)) return;
    const res = await adminSetRole(id, !currentAdminStatus);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Updated", "User role successfully changed.");
  };

  const handleResetPassword = async (id: string) => {
    const newPass = prompt("Enter new minimum 6 character password:");
    if (!newPass || newPass.length < 6) return toast.error("Invalid", "Password too short.");
    const res = await adminResetPassword(id, newPass);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Password Reset", "User password updated.");
  };

  return (
    <>
      <div className="jira-filter-bar">
        <div className="admin-search-wrapper">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
          />
        </div>

        <select className="jira-filter-btn" value={role} onChange={(e) => updateFilters("role", e.target.value)}>
          <option value="all">Role: All</option>
          <option value="admin">Admin Only</option>
        </select>

        <select className="jira-filter-btn" value={status} onChange={(e) => updateFilters("status", e.target.value)}>
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

      </div>

      {selectedUsers.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-text">{selectedUsers.size} users selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkDelete} className="btn btn-sm btn-ghost" style={{ background: "rgba(196,30,58,0.1)", color: "var(--error)" }}>
              <Trash2 size={14} className="mr-1" /> Bulk Delete
            </button>
          </div>
        </div>
      )}

      <div className="jira-table-container">
        <table className="jira-table">
          <thead>
            <tr>
              <th className="pl-4 w-10">
                <input type="checkbox" checked={selectedUsers.size === data.users.length && data.users.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("username")}>
                <div className="flex items-center">User <SortIcon col="username" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("postCount")}>
                <div className="flex items-center">Posts <SortIcon col="postCount" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center">Joined <SortIcon col="createdAt" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("status")}>
                <div className="flex items-center">Status <SortIcon col="status" /></div>
              </th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user: any) => (
              <tr key={user.id} className={selectedUsers.has(user.id) ? "jira-table-row-selected" : ""}>
                <td className="pl-4">
                  <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="cursor-pointer" />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-tertiary overflow-hidden relative">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-tertiary text-[0.75rem]">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <a href={`/profile/${user.username}`} target="_blank" className="font-bold text-primary no-underline hover:underline">
                      @{user.username}
                    </a>
                  </div>
                </td>
                <td className="text-secondary">{user.postCount}</td>
                <td className="text-secondary text-[0.8rem]">
                  {new Date(user.createdAt).toLocaleDateString()}
                  <div className="text-[0.7rem] text-tertiary">
                    {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  <InlineUserStatus user={user} />
                </td>
                <td className="text-right pr-4">
                  <div className="admin-actions-group">
                    <button onClick={() => setEditingUser(user)} className="admin-action-btn-ghost" title="Edit Profile">
                      <Edit2 size={14} />
                    </button>
                    {!user.isAdmin && (
                      <button 
                        onClick={() => handleToggleSuspension(user.id)} 
                        className="admin-action-btn-ghost" 
                        style={{ color: user.isSuspended ? "var(--success)" : "var(--error)" }}
                        title={user.isSuspended ? "Restore" : "Suspend"}
                      >
                        {user.isSuspended ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      </button>
                    )}
                    <div className="admin-menu-container">
                      <button className="admin-action-btn-ghost"><MoreVertical size={14} /></button>
                      <div className="admin-hover-menu">
                        <button onClick={() => handleToggleRole(user.id, user.isAdmin)} className="admin-menu-item">
                          <Shield size={16} className="text-accent" /> {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                        <button onClick={() => handleResetPassword(user.id)} className="admin-menu-item">
                          <KeyRound size={16} className="text-accent" /> Reset Password
                        </button>
                        {!user.isAdmin && (
                          <button onClick={() => handleDelete(user.id)} className="admin-menu-item admin-menu-item-danger">
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.users.length === 0 && <div className="admin-empty-state">No users found.</div>}
      </div>

      {data.totalPages > 1 && (
        <div className="admin-pagination">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set("page", (i + 1).toString());
            return (
              <Link
                key={i}
                href={`?${current.toString()}`}
                className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-ghost"}`}
                style={{ width: 36, padding: 0, justifyContent: "center", display: "flex", alignItems: "center" }}
              >
                {i + 1}
              </Link>
            );
          })}
        </div>
      )}

      {editingUser && (
        <div className="admin-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="admin-side-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>
            <form action={async (formData) => {
              const res = await adminUpdateUser(editingUser.id, {
                displayName: formData.get("displayName"),
                bio: formData.get("bio"),
                avatarUrl: editingUser.avatarUrl, // Use the state which might have the uploaded URL
                collegeYears: parseInt(formData.get("collegeYears") as string, 10) || null,
                registrationNo: formData.get("registrationNo"),
                enrollmentNo: formData.get("enrollmentNo"),
              });
              if (res.success) {
                toast.success("Saved", "User data updated.");
                setEditingUser(null);
              } else {
                toast.error("Error", res.error || "Failed to update user.");
              }
            }} className="admin-form-group">
              <div className="admin-avatar-picker-group">
                <div 
                  className="admin-avatar-picker-wrapper" 
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  {editingUser.avatarUrl ? (
                    <Image src={editingUser.avatarUrl} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent-soft text-accent">
                      <Camera size={32} />
                    </div>
                  )}
                  <div className="admin-avatar-overlay">
                    <Camera size={20} />
                    <span>Change Photo</span>
                  </div>
                  {uploading && (
                    <div className="admin-avatar-loading">
                      <div className="admin-avatar-loading-spinner" />
                    </div>
                  )}
                </div>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploading(true);
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await uploadFile(formData);
                    setUploading(false);
                    
                    if (res?.url) {
                      setEditingUser({ ...editingUser, avatarUrl: res.url });
                      toast.success("Uploaded", "New avatar ready to save.");
                    } else if (res?.error) {
                      toast.error("Upload Failed", res.error);
                    }
                  }}
                />
                <p className="text-[0.7rem] text-tertiary">Click to upload a new profile picture</p>
              </div>

              <div className="input-group"><label className="input-label">Username (Read-only)</label><input type="text" className="input bg-tertiary" defaultValue={editingUser.username} disabled /></div>

              <div className="input-group"><label className="input-label">Display Name</label><input type="text" name="displayName" className="input" defaultValue={editingUser.displayName || ""} /></div>
              
              <div className="admin-grid gap-4">
                <div className="input-group"><label className="input-label">Registration No</label><input type="text" name="registrationNo" className="input" defaultValue={editingUser.registrationNo || ""} /></div>
                <div className="input-group"><label className="input-label">Enrollment No</label><input type="text" name="enrollmentNo" className="input" defaultValue={editingUser.enrollmentNo || ""} /></div>
              </div>

              <div className="input-group"><label className="input-label">College Years</label><input type="number" name="collegeYears" min={1} max={6} className="input" defaultValue={editingUser.collegeYears || ""} /></div>
              <div className="input-group"><label className="input-label">Bio (Markdown)</label><textarea name="bio" className="input" rows={6} defaultValue={editingUser.bio || ""} /></div>
              <button type="submit" className="btn btn-primary w-full mt-4">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function InlineUserStatus({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const handleInlineChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!confirm("Confirm status change?")) return;
    const val = e.target.value;
    setLoading(true);
    if (val === "suspended" && !user.isSuspended) {
      if (user.isAdmin) await adminSetRole(user.id, false);
      await toggleUserSuspension(user.id);
    } else if (val === "active") {
      if (user.isSuspended) await toggleUserSuspension(user.id);
      if (user.isAdmin) await adminSetRole(user.id, false);
    } else if (val === "admin") {
      if (user.isSuspended) await toggleUserSuspension(user.id);
      if (!user.isAdmin) await adminSetRole(user.id, true);
    }
    setLoading(false);
  };

  const curr = user.isSuspended ? "suspended" : user.isAdmin ? "admin" : "active";
  const statusClass = curr === "suspended" ? "status-suspended" : curr === "admin" ? "status-admin" : "status-active";
  if (loading) return <span className="text-[0.7rem] text-tertiary">Saving...</span>;

  return (
    <div className="admin-status-wrapper">
      <select value={curr} onChange={handleInlineChange} className={`admin-status-select ${statusClass}`}>
        <option value="active">ACTIVE</option>
        <option value="admin">ADMIN</option>
        <option value="suspended">SUSPENDED</option>
      </select>
      <span className={`admin-status-arrow ${curr === "admin" ? "text-info" : ""}`}>▼</span>
    </div>
  );
}
