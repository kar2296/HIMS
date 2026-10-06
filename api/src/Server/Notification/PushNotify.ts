import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Firebase credentials are loaded from a gitignored JSON key file.
// To set up: download your service account key from Google Cloud Console
// and place it at: api/src/Server/Notification/firebase-service-account.json
// See .env.example for the alternative env-variable approach.

let serviceAccount: admin.ServiceAccount;

const KEY_FILE = path.resolve(__dirname, 'firebase-service-account.json');

if (fs.existsSync(KEY_FILE)) {
    // Preferred: load from gitignored JSON file (downloaded from Google Cloud Console)
    serviceAccount = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'));
} else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Alternative: load individual fields from environment variables (CI/CD / cloud deployments)
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
} else {
    console.warn(
        '[PushNotify] Firebase credentials not found. Push notifications will be disabled.\n' +
        '  Option 1: Place firebase-service-account.json in api/src/Server/Notification/\n' +
        '  Option 2: Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in .env'
    );
}

export const notify = serviceAccount
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
    : null;
