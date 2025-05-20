import admin from "firebase-admin";

const raw = process.env.FIREBASE_SDK_KEY!;
const serviceAccount = JSON.parse(raw);

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;