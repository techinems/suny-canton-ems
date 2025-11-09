import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadFile, deleteFile, getFileById } from "@/lib/server/fileService";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/profile/avatar
 * Upload or update user avatar
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (limit to 5MB for avatars)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload new avatar
    const uploadedFile = await uploadFile(session.user.id, {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
    });

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    // Delete old avatar if it exists
    if (currentUser?.avatar) {
      try {
        await deleteFile(currentUser.avatar, session.user.id, false);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continue even if old avatar deletion fails
      }
    }

    // Update user's avatar field with the new file ID
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: uploadedFile.id },
      select: {
        id: true,
        avatar: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({ 
      user: updatedUser,
      file: uploadedFile 
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Remove user avatar
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (!currentUser?.avatar) {
      return NextResponse.json(
        { error: "No avatar to delete" },
        { status: 404 }
      );
    }

    // Delete the avatar file
    await deleteFile(currentUser.avatar, session.user.id, false);

    // Update user's avatar field to null
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
      select: {
        id: true,
        avatar: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/avatar
 * Get user's avatar file info
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (!currentUser?.avatar) {
      return NextResponse.json(
        { error: "No avatar found" },
        { status: 404 }
      );
    }

    // Get the file details
    const file = await getFileById(currentUser.avatar);

    if (!file) {
      return NextResponse.json(
        { error: "Avatar file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}
