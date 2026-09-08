const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Service Account Key ফাইলটি লোড করা
// সতর্কতা: প্রোডাকশনে এই ফাইলটি ভার্সন কন্ট্রোল (Git) এ কমিট করবেন না। 
// এর পরিবর্তে Environment Variable ব্যবহার করা উচিত।
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET // .env ফাইলে এটি যোগ করবেন
  });
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

module.exports = { db, storage, auth, admin };