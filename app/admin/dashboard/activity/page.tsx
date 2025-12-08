import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import ActivityContent from './activity-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/admin/login');
  }

  try {
    const payload = await verifyAccessToken(accessToken);
    
    if (!payload.roles.includes('admin')) {
      redirect('/admin/login');
    }

    // Fetch recent audit logs
    const auditLogs = await prisma.authAuditLog.findMany({
      where: { adminId: payload.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return <ActivityContent logs={auditLogs} />;
  } catch {
    redirect('/admin/login');
  }
}
