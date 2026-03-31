import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/upload
 * Accepts a multipart/form-data with a "file" field.
 * Uploads it to Vercel Blob and returns the blob metadata.
 *
 * Expected form data:
 *   file: File (.xlsx or .csv)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send multipart/form-data with a "file" field.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',                                          // .xls
      'text/csv',                                                           // .csv
      'application/csv',
    ];

    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');

    if (!isValidExtension && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .xlsx, .xls, and .csv files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Generate a unique path with timestamp
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobPath = `inventory/${timestamp}_${safeName}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        contentType: file.type || 'application/octet-stream',
        originalName: file.name,
      },
    });
  } catch (error) {
    console.error('[/api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
