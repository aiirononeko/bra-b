-- CreateTable
CREATE TABLE "baristas" (
    "id" UUID NOT NULL,
    "storeId" INTEGER,

    CONSTRAINT "baristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "bio" TEXT,
    "baristaId" UUID NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_baristaId_key" ON "profiles"("baristaId");

-- AddForeignKey
ALTER TABLE "baristas" ADD CONSTRAINT "baristas_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_baristaId_fkey" FOREIGN KEY ("baristaId") REFERENCES "baristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
