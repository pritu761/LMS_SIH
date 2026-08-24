import { NextRequest, NextResponse } from 'next/server';
import { saveLocalFile } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'TRAINER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Faculty or Admin privileges required for media upload' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided in the request payload' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to local public/uploads directory (100% free, zero cloud cost)
    const result = await saveLocalFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      message: 'File successfully uploaded and stored on local server (Zero-Cost Local Storage)',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
