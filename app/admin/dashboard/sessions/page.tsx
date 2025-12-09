import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/jwt';
import SessionsContent from './sessions-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SessionsPage() {
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
  } catch {
    redirect('/admin/login');
  }

  return <SessionsContent />;
}
