import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "createdAt"> & {
  createdAt: string;
};

export const user_settings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  messageCount: integer("message_count").notNull().default(0),
  freeChats: integer("free_chats"),
  freeMessages: integer("free_messages"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type UserSettings = typeof user_settings.$inferSelect;

export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});
export type SafeChat = Omit<typeof chats.$inferSelect, "createdAt"> & {
  createdAt: string;
};

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});
export type Message = typeof messages.$inferSelect;
export type SafeMessage = Omit<Message, "createdAt"> & {
  createdAt: string;
};

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().notNull(),
  userId: varchar("user_id", { length: 256 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
    .notNull()
    .unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 256,
  }).unique(),
  stripePriceId: varchar("stripe_price_id", { length: 256 }),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .references(() => messages.id)
    .notNull(),
  chatId: uuid("chat_id")
    .references(() => chats.id)
    .notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type SafeSource = Omit<typeof sources.$inferSelect, "createdAt"> & {
  createdAt: string;
};

export const feature_flags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  flag: varchar("flag", { length: 256 }).notNull(),
  enabled: boolean("enabled").default(false),
});

export const app_settings = pgTable("app_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
