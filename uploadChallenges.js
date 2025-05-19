require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Læs challenges fra .json-filen
const challenges = JSON.parse(fs.readFileSync('challenges.json'));

// Funktion til at uploade challenges til Firestore
async function uploadChallenges() {
  for (const challenge of challenges) {
    try {
      // Tilføj challenge til Firestore
      await db.collection('challenges').add(challenge);
      console.log(`✅ Tilføjede: ${challenge.title}`);
    } catch (error) {
      console.error('Fejl ved upload af challenge:', challenge.title, error);
    }
  }
  console.log('✅ Alle challenges er uploadet!');
}

uploadChallenges().catch(console.error);
