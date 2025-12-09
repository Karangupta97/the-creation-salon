import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/jwt';
import DashboardContent from './dashboard-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Server-side authentication check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/admin/login');
  }

  let payload;
  try {
    payload = await verifyAccessToken(accessToken);
    
    // Verify admin role
    if (!payload.roles.includes('admin')) {
      redirect('/admin/login');
    }
  } catch {
    redirect('/admin/login');
  }

  // Pass user data to client component
  return <DashboardContent user={payload} />;
}
