-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('PROCESSING', 'DONE', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audio_url" TEXT,
    "duration" INTEGER NOT NULL,
    "status" "TranscriptionStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "term" VARCHAR(255) NOT NULL,
    "preferred_spelling" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dictionary_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "transcriptions_user_id_created_at_idx" ON "transcriptions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "dictionary_items_user_id_idx" ON "dictionary_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_items_user_id_term_key" ON "dictionary_items"("user_id", "term");

-- AddForeignKey
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_items" ADD CONSTRAINT "dictionary_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
