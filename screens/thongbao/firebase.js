import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAJbEjRkONfhHvZ97XLzJa2X0YKxwl_vgE",
  authDomain: "duantotnghiep-42700.firebaseapp.com",
  databaseURL: "https://duantotnghiep-42700-default-rtdb.firebaseio.com",
  projectId: "duantotnghiep-42700",
  storageBucket: "duantotnghiep-42700.appspot.com",
  messagingSenderId: "723250201926",
  appId: "1:723250201926:web:caf1ff4894532b55e95147"
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