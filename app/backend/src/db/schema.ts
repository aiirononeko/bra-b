import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// ユーザーテーブル
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    authType: text("auth_type").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
    };
  },
);

// プロフィールテーブル
export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    displayName: text("display_name").notNull(),
    iconUrl: text("icon_url"),
    bio: text("bio"),
    snsLinks: text("sns_links"),
    shopName: text("shop_name"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.userId),
    };
  },
);

// 評価カテゴリテーブル
export const evaluationCategories = sqliteTable("evaluation_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 評価項目テーブル
export const evaluationItems = sqliteTable(
  "evaluation_items",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => evaluationCategories.id),
    name: text("name").notNull(),
    isCommon: integer("is_common", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      categoryIdIdx: index("category_id_idx").on(table.categoryId),
    };
  },
);

// 評価テーブル
export const evaluations = sqliteTable(
  "evaluations",
  {
    id: text("id").primaryKey(),
    baristaProfileId: text("barista_profile_id")
      .notNull()
      .references(() => profiles.id),
    evaluatorUserId: text("evaluator_user_id")
      .notNull()
      .references(() => users.id),
    evaluatedAt: text("evaluated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      baristaProfileIdIdx: index("barista_profile_id_idx").on(table.baristaProfileId),
      evaluatorUserIdIdx: index("evaluator_user_id_idx").on(table.evaluatorUserId),
    };
  },
);

// 評価詳細テーブル
export const evaluationDetails = sqliteTable(
  "evaluation_details",
  {
    id: text("id").primaryKey(),
    evaluationId: text("evaluation_id")
      .notNull()
      .references(() => evaluations.id),
    evaluationItemId: text("evaluation_item_id")
      .notNull()
      .references(() => evaluationItems.id),
  },
  (table) => {
    return {
      evaluationIdIdx: index("evaluation_id_idx").on(table.evaluationId),
      evaluationItemIdIdx: index("evaluation_item_id_idx").on(table.evaluationItemId),
    };
  },
);

// チップテーブル
export const tips = sqliteTable(
  "tips",
  {
    id: text("id").primaryKey(),
    baristaProfileId: text("barista_profile_id")
      .notNull()
      .references(() => profiles.id),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(),
    sentAt: text("sent_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    paymentInfo: text("payment_info"),
    message: text("message"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
  },
  (table) => {
    return {
      baristaProfileIdIdx: index("tip_barista_profile_id_idx").on(table.baristaProfileId),
      senderUserIdIdx: index("sender_user_id_idx").on(table.senderUserId),
    };
  },
);

// お気に入りテーブル
export const favorites = sqliteTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    baristaProfileId: text("barista_profile_id")
      .notNull()
      .references(() => profiles.id),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userIdIdx: index("favorite_user_id_idx").on(table.userId),
      baristaProfileIdIdx: index("favorite_barista_profile_id_idx").on(table.baristaProfileId),
      uniqueUserBarista: index("unique_user_barista_idx").on(table.userId, table.baristaProfileId),
    };
  },
);
