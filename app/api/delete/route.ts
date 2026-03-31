import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * DELETE /api/delete
 * Body: { url: string }  — the Blob URL to delete.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string };

    if (!body.url) {
      return NextResponse.json(
        { error: 'Missing "url" in request body.' },
        { status: 400 }
      );
    }

    // Validate URL is a Vercel Blob URL (security check)
    const blobDomain = 'blob.vercel-storage.com';
    const publicBlobDomain = 'public.blob.vercel-storage.com';

    if (!body.url.includes(blobDomain) && !body.url.includes(publicBlobDomain)) {
      return NextResponse.json(
        { error: 'Invalid URL. Only Vercel Blob URLs can be deleted.' },
        { status: 400 }
      );
    }

    await del(body.url);

    return NextResponse.json({ success: true, deleted: body.url });
  } catch (error) {
    console.error('[/api/delete] Error:', error);
    return NextResponse.json(
      { error: 'Delete failed. Please try again.' },
      { status: 500 }
    );
  }
}
