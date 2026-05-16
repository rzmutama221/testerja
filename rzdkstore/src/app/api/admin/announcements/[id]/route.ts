import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * PUT /api/admin/announcements/[id] — Update announcement
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, content, type, target, productIds, categoryIds, isActive, publishedAt, expiresAt } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (type !== undefined) data.type = type;
    if (target !== undefined) data.target = target;
    if (productIds !== undefined) data.productIds = productIds;
    if (categoryIds !== undefined) data.categoryIds = categoryIds;
    if (isActive !== undefined) data.isActive = isActive;
    if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const announcement = await prisma.announcement.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('[UPDATE_ANNOUNCEMENT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal update' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Announcement berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE_ANNOUNCEMENT_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal hapus' }, { status: 500 });
  }
}
