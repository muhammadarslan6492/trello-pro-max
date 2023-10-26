-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "isExpired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;
