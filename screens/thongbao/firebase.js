import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBivfS7XlsYR4gyrzpVqMgEVD3_vDvNcLg",
  authDomain: "notifycation-9c71a.firebaseapp.com",
  databaseURL: "https://notifycation-9c71a-default-rtdb.firebaseio.com",
  projectId: "notifycation-9c71a",
  storageBucket: "notifycation-9c71a.firebasestorage.app",
  messagingSenderId: "311969528059",
  appId: "1:311969528059:web:4001d6c5d813fe4300185e",
 
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