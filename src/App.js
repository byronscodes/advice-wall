import logo from './logo.svg';
import './App.css';
import AddDialog from './AddDialog';
import React, { useState } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvGktE2JIn6MRfnAF9exoRYvFWtAVPLzs",
  authDomain: "advice-wall.firebaseapp.com",
  projectId: "advice-wall",
  storageBucket: "advice-wall.firebasestorage.app",
  messagingSenderId: "196555767023",
  appId: "1:196555767023:web:1e6ca4d9544c039b37ef1a",
  databaseURL: "https://advice-wall-default-rtdb.firebaseio.com",
  measurementId: "G-TNLPNPEH6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);

  return (
    <div className="App">
      <header className="App-header">
        <div className="titleDiv">
          <a href="#" className="title">Advice Wall</a>
        </div>
        <button className="add" onClick={handleOpen}><span className="material-symbols-outlined">add</span></button>
        <AddDialog open={dialogOpen} onClose={handleClose} />
      </header>
    </div>
  );
}

export default App;
