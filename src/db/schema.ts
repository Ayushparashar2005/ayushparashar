import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

export const projects = pgTable("projects", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    tech: text("tech").array(),
    category: text("category"),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    signalFlow: jsonb("signal_flow"),
    status: text("status").default('DRAFT').notNull(),
    featured: boolean("featured").default(false).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const projectDrafts = pgTable("project_drafts", {
    id: text("id").primaryKey(),
    repoFullName: text("repo_full_name").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    tech: text("tech").array(),
    category: text("category"),
    githubUrl: text("github_url"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const youtubeVideos = pgTable("youtube_videos", {
    id: text("id").primaryKey(), // YouTube Video ID
    title: text("title").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    publishedAt: timestamp("published_at").notNull(),
    status: text("status").default('PUBLISHED').notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const youtubePlaylists = pgTable("youtube_playlists", {
    id: text("id").primaryKey(), // YouTube Playlist ID
    title: text("title").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const experience = pgTable("experience", {
    id: text("id").primaryKey(),
    company: text("company").notNull(),
    role: text("role").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    description: text("description"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const skills = pgTable("skills", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(), // Languages, Technologies, Concepts
    proficiency: integer("proficiency").default(50),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const certifications = pgTable("certifications", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    issuer: text("issuer").notNull(),
    date: text("date").notNull(),
    credentialUrl: text("credential_url"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const messages = pgTable("messages", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    urgency: text("urgency").default("0.5").notNull(),
    status: text("status").default("UNREAD").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});
