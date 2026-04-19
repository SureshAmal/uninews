"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions/posts";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface PostActionsProps {
  postId: string;
  isAuthor: boolean;
  isAdmin: boolean;
}

export function PostActions({ postId, isAuthor, isAdmin }: PostActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deletePost(postId);
    setIsDeleting(false);
  };

  if (!isAuthor) return null;

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={isAdmin ? "Wipe Edition?" : "Archive Edition?"}
        message={isAdmin 
            ? "As an admin, you are permanently deleting this data from the database. This cannot be undone." 
            : "Are you sure you want to archive this edition? It will be hidden from the feed and your profile."}
        confirmText={isAdmin ? "Hard Delete" : "Archive Edition"}
      />

      <div className={`flex gap-2 ${isDeleting ? "opacity-50" : "opacity-100"}`}>
        <Link
          href={`/post/${postId}/edit`}
          className="btn btn-secondary btn-sm flex items-center gap-1"
        >
          <Pencil size={16} /> Edit
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-outline btn-sm flex items-center gap-1 text-error border-error-soft hover:bg-error-soft"
          disabled={isDeleting}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </>
  );
}
