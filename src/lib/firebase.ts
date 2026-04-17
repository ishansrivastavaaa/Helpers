import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Test Firebase Database Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Firebase database connection is live and working perfectly.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user is blocked in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data()?.blocked) {
      await logout();
      throw new Error("Your account has been blocked by the administrator.");
    }

    // Upsert user document (don't overwrite blocked status)
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("User closed the login popup.");
    } else {
      console.error("Error during sign-in/registration", error);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
