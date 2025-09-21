import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { user } from "./schema.auth";

export const userProfile = sqliteTable(
  "user_profile",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    spotifyId: text("spotify_id").unique(),
  },
  (table) => [primaryKey({ columns: [table.userId] })],
);

export const userBucket = sqliteTable("user_bucket", {
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bucketId: text("bucket_id")
    .notNull()
    .references(() => bucket.id, { onDelete: "cascade" }),
});

export const bucket = sqliteTable("bucket", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  visibility: integer("visibility").notNull().default(0),
  createdAt: integer("created_at").notNull().default(Date.now()),
  updatedAt: integer("updated_at").notNull().default(Date.now()),
  playlistIds: text("playlist_ids", { mode: "json" })
    .notNull()
    .default("[]")
    .$type<string[]>(),
});
