import admin from 'firebase-admin';

if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SDK_KEY;

    if (!raw) {
        throw new Error('FIREBASE_SDK_KEY environment variable is not set');
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(raw);
    } catch (error) {
        throw new Error('Invalid FIREBASE_SDK_KEY: must be valid JSON');
    }

    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(
            /\\n/g,
            '\n'
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
