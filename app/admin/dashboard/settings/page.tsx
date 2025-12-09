import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import SettingsContent from './settings-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  // Server-side authentication check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/admin/login');
  }

  let admin;
  try {
    const payload = await verifyAccessToken(accessToken);
    
    // Verify admin role
    if (!payload.roles.includes('admin')) {
      redirect('/admin/login');
    }

    // Fetch admin data including 2FA status
    admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      redirect('/admin/login');
    }
  } catch {
    redirect('/admin/login');
  }

  return <SettingsContent admin={admin} />;
}
