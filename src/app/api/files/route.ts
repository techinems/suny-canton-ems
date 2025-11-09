import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  uploadFile,
  getAllFiles,
  getFilesByUserId,
} from "@/lib/server/fileService";

/**
 * GET /api/files
 * Get all files for the current user, or all files if admin
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    const isAdmin = user.isAdmin === true;

    let files;
    if (isAdmin) {
      files = await getAllFiles();
    } else {
      files = await getFilesByUserId(user.id);
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files
 * Upload a new file
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

    // Validate file size (limit to 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const uploadedFile = await uploadFile(session.user.id, {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
    });

    return NextResponse.json({ file: uploadedFile }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
