import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Your Firebase Config (Replace with your credentials)
/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
*/

const firebaseConfig = {
    apiKey: "AIzaSyCjDEuDzVS_s4MF1ehUHrQz9FOs2rjBoGQ",
    authDomain: "zepto-d60af.firebaseapp.com",
    projectId: "zepto-d60af",
    storageBucket: "zepto-d60af.firebasestorage.app",
    messagingSenderId: "1083665516694",
    appId: "1:1083665516694:web:4ce4910cf332e0e8189ab7",
    measurementId: "G-CH3TN31DVY"
  };

  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const messaging = getMessaging(app);

// Request permission for notifications
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {

      const token = await getToken(messaging, { vapidKey: "BEWKBcaABFAxD2w-fBPPhAAyEocdC50rMmUoIOolL6R7uySM6gk6-OSSphnnAWWoVcxJN0JrimA2qaypLmKU_LQ" });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("Permission not granted for notifications");
    }
  } catch (error) {
    console.error("Permission Denied:", error);
  }
};

// Handle notifications when app is open
onMessage(messaging, (payload) => {
  console.log("Notification Received:", payload);
});

export { auth, googleProvider, facebookProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier };
