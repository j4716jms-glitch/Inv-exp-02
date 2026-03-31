import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFromUrl } from '@/lib/ExcelParser';

/**
 * GET /api/parse?url=<blob-url>
 * Fetches and parses an Excel/CSV file from the given URL.
 * Returns unified JSON data + column list.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter.' },
      { status: 400 }
    );
  }

  try {
    const { unified, columns, sheets } = await parseExcelFromUrl(url);

    return NextResponse.json({
      data: unified,
      columns,
      sheetNames: sheets.map((s) => s.sheetName),
      totalRows: unified.length,
    });
  } catch (error) {
    console.error('[/api/parse] Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file. Ensure it is a valid .xlsx or .csv file.' },
      { status: 500 }
    );
  }
}
