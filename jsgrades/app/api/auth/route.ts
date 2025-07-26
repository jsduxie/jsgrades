import { NextResponse } from 'next/server';
import admin from '@/lib/server/firebase';
import pool from '@/lib/server/db';

export async function POST(req: Request) {
    const header = req.headers.get('authorization');
    if (!header?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'No token' }, { status: 401 });
    }

    const token = header.split(' ')[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decoded;

        const userQuery = await pool.query(
            'SELECT * FROM users WHERE uid = $1',
            [uid]
        );

        if (userQuery.rows.length === 0) {
            const insertQuery = `
        INSERT INTO users (uid, email, name)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
            const newUser = await pool.query(insertQuery, [uid, email, name]);
            return NextResponse.json(
                { user: newUser.rows[0] },
                { status: 201 }
            );
        }

        return NextResponse.json({ user: userQuery.rows[0] }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { message: `Invalid Token: ${err}` },
            { status: 401 }
        );
    }
}
