import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getActiveSessions, revokeSession, revokeAllSessions } from '@/lib/session';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);

    const sessions = await getActiveSessions(payload.sub);

    return NextResponse.json({ ok: true, sessions });
  } catch (error) {
    logger.error({ error }, 'Error fetching sessions');
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    const { sessionId, revokeAll } = await request.json();

    if (revokeAll) {
      // Revoke all sessions
      await revokeAllSessions(payload.sub);
      return NextResponse.json({ ok: true, message: 'All sessions revoked' });
    }

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Revoke specific session
    const success = await revokeSession(sessionId, payload.sub);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Failed to revoke session' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Session revoked' });
  } catch (error) {
    logger.error({ error }, 'Error revoking session');
    return NextResponse.json(
      { ok: false, error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
