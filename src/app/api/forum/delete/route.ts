import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { docId, collectionName } = await request.json();

    if (!docId || !collectionName) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Menggunakan adminDb agar bisa menghapus tanpa terhalang Rules atau Session
    await adminDb.collection(collectionName).doc(docId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}