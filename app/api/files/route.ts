import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/files
 * Returns all files stored in Vercel Blob under the "inventory/" prefix.
 */
export async function GET() {
  try {
    const { blobs } = await list({
      prefix: 'inventory/',
    });

    const files = blobs
      .filter((b) => {
        const name = b.pathname.toLowerCase();
        return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
      })
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt.toISOString(),
        contentType: b.contentType,
      }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[/api/files] Error:', error);
    return NextResponse.json({ files: [], error: 'Could not list files.' });
  }
}
