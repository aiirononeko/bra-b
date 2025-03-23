-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "auth_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expires_at" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" DATETIME,
    "refresh_token_expires_at" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon_url" TEXT,
    "bio" TEXT,
    "sns_links" TEXT,
    "shop_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluation_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "evaluation_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_common" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluation_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "evaluation_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barista_profile_id" TEXT NOT NULL,
    "evaluator_user_id" TEXT NOT NULL,
    "evaluated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluations_barista_profile_id_fkey" FOREIGN KEY ("barista_profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evaluations_evaluator_user_id_fkey" FOREIGN KEY ("evaluator_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluation_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluation_id" TEXT NOT NULL,
    "evaluation_item_id" TEXT NOT NULL,
    CONSTRAINT "evaluation_details_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evaluation_details_evaluation_item_id_fkey" FOREIGN KEY ("evaluation_item_id") REFERENCES "evaluation_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barista_profile_id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_info" TEXT,
    "message" TEXT,
    "stripe_payment_intent_id" TEXT,
    CONSTRAINT "tips_barista_profile_id_fkey" FOREIGN KEY ("barista_profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tips_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "barista_profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "favorites_barista_profile_id_fkey" FOREIGN KEY ("barista_profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_barista_profile_id_key" ON "favorites"("user_id", "barista_profile_id");
