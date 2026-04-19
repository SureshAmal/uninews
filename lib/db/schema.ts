import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  collegeYears: integer("college_years"),
  registrationNo: varchar("registration_no", { length: 50 }),
  enrollmentNo: varchar("enrollment_no", { length: 50 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Posts ────────────────────────────────────────────────────────────
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    excerpt: varchar("excerpt", { length: 400 }),
    coverImageUrl: text("cover_image_url"),
    mediaUrls: jsonb("media_urls").$type<
      { url: string; type: "image" | "video" }[]
    >(),
    category: varchar("category", { length: 50 }).notNull().default("campus"),
    tags: text("tags").array(),
    viewCount: integer("view_count").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    isFlagged: boolean("is_flagged").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at"),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_category_idx").on(table.category),
    index("posts_created_idx").on(table.createdAt),
  ]
);

// ─── Follows ─────────────────────────────────────────────────────────
export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followingId: uuid("following_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
  ]
);

// ─── Likes ───────────────────────────────────────────────────────────
export const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

// ─── Saves (Bookmarks) ──────────────────────────────────────────────
export const saves = pgTable(
  "saves",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

// ─── Reposts ─────────────────────────────────────────────────────────
export const reposts = pgTable(
  "reposts",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

// ─── Reviews ─────────────────────────────────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewerId: uuid("reviewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(), // 1-5
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_unique_idx").on(table.reviewerId, table.postId),
  ]
);

// ─── Post Views (for ranking) ────────────────────────────────────────
export const postViews = pgTable(
  "post_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    viewerId: uuid("viewer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => [index("post_views_post_idx").on(table.postId, table.viewedAt)]
);

// ─── Comments ────────────────────────────────────────────────────
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_idx").on(table.postId, table.createdAt),
  ]
);

// ─── Announcements ───────────────────────────────────────────────────
export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Audit Logs ─────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .references(() => users.id, { onDelete: "set null" }), // NULL if admin was hard-deleted later
    actionType: varchar("action_type", { length: 50 }).notNull(), // e.g. DELETE_USER, PIN_POST
    targetId: varchar("target_id", { length: 100 }), // The ID of the thing affected (can be UUID or string)
    description: text("description"), // Human readable log "Admin X deleted User Y"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt)]
);

// ─── Type exports ────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
