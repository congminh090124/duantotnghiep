import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDxCP_J1Fs2ykvJxJMmhznUlmNFQO1T-5w",
  authDomain: "notification-44d1b.firebaseapp.com",
  databaseURL: "https://notification-44d1b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "notification-44d1b",
  storageBucket: "notification-44d1b.firebasestorage.app",
  messagingSenderId: "1040954361921",
  appId: "1:1040954361921:web:c4ecad2e482aebbc2f9ec0",
};

// Kiểm tra xem Firebase đã được khởi tạo chưa
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const database = getDatabase(app);

export { database };