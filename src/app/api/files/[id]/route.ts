import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getFileById,
  updateFile,
  deleteFile,
  canAccessFile,
  getFilePath,
} from "@/lib/server/fileService";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

/**
 * GET /api/files/[id]
 * Download a file by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { user } = session;
    const isAdmin = user.isAdmin === true;

    // Check if user can access this file
    const hasAccess = await canAccessFile(id, user.id, isAdmin);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const file = await getFileById(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file from disk
    const filePath = getFilePath(file);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.originalName}"`,
        "Content-Length": file.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/files/[id]
 * Update file metadata
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { user } = session;
    const isAdmin = user.isAdmin === true;

    const body = await req.json();
    const { originalName } = body;

    if (!originalName) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updatedFile = await updateFile(id, user.id, isAdmin, {
      originalName,
    });

    if (!updatedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ file: updatedFile });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]
 * Delete a file
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { user } = session;
    const isAdmin = user.isAdmin === true;

    const deleted = await deleteFile(id, user.id, isAdmin);

    if (!deleted) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
