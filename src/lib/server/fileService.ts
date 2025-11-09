import { prisma } from "../prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export interface FileUpload {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensure the uploads directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Generate a unique filename to avoid collisions
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Upload a file for a user
 */
export async function uploadFile(
  userId: string,
  fileData: FileUpload
): Promise<FileRecord> {
  await ensureUploadDir();

  // Generate unique filename
  const filename = generateUniqueFilename(fileData.originalName);
  const relativePath = filename;
  const fullPath = path.join(UPLOAD_DIR, relativePath);

  // Write file to disk
  await writeFile(fullPath, fileData.buffer);

  // Create database record
  const file = await prisma.file.create({
    data: {
      filename,
      originalName: fileData.originalName,
      mimeType: fileData.mimeType,
      size: fileData.size,
      path: relativePath,
      uploadedBy: userId,
    },
  });

  return file;
}

/**
 * Get a file by ID
 * Returns null if file doesn't exist
 */
export async function getFileById(fileId: string): Promise<FileRecord | null> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  return file;
}

/**
 * Get all files for a user
 */
export async function getFilesByUserId(userId: string): Promise<FileRecord[]> {
  const files = await prisma.file.findMany({
    where: { uploadedBy: userId },
    orderBy: { createdAt: "desc" },
  });

  return files;
}

/**
 * Get all files (admin only)
 */
export async function getAllFiles(): Promise<FileRecord[]> {
  const files = await prisma.file.findMany({
    include: {
      uploader: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return files;
}

/**
 * Update file metadata
 * Only the uploader or admin can update
 */
export async function updateFile(
  fileId: string,
  userId: string,
  isAdmin: boolean,
  updates: { originalName?: string }
): Promise<FileRecord | null> {
  // Check if file exists and user has permission
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return null;
  }

  if (!isAdmin && file.uploadedBy !== userId) {
    throw new Error("Unauthorized: You can only update your own files");
  }

  // Update file metadata
  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: updates,
  });

  return updatedFile;
}

/**
 * Delete a file
 * Only the uploader or admin can delete
 */
export async function deleteFile(
  fileId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  // Check if file exists and user has permission
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return false;
  }

  if (!isAdmin && file.uploadedBy !== userId) {
    throw new Error("Unauthorized: You can only delete your own files");
  }

  // Delete physical file
  const fullPath = path.join(UPLOAD_DIR, file.path);
  try {
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (error) {
    console.error(`Failed to delete physical file: ${error}`);
    // Continue with database deletion even if file deletion fails
  }

  // Delete database record
  await prisma.file.delete({
    where: { id: fileId },
  });

  return true;
}

/**
 * Get the full path to a file
 */
export function getFilePath(file: FileRecord): string {
  return path.join(UPLOAD_DIR, file.path);
}

/**
 * Check if a user can access a file
 */
export async function canAccessFile(
  fileId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) {
    return true;
  }

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return false;
  }

  return file.uploadedBy === userId;
}
