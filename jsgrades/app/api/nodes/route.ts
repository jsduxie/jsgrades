import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await validateAuth(req);

        if (!user) {
            return;
        }
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        console.warn(`Error: ${error}`);
    }
}
