import './App.css';
import AddDialog from './AddDialog';
import NoteList from './NotesList';
import NoteCloud from './NoteCloud';
import SelectedNote from './SelectedNote'
import CloudSelector from './CloudSelector';
import React, { useState, useEffect } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";

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

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const notesRef = ref(db, 'notes');
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      Object.entries(data).forEach(([id, note]) => {
        if (note.expiresAt && note.expiresAt < Date.now()) {
          remove(ref(db, `notes/${id}`));
        }
      });
      const noteList = Object.entries(data).map(([id, value]) => ({ id, ...value }));
      setNotes(noteList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();

    const interval = setInterval(() => {
      const notesRef = ref(db, 'notes');
      get(notesRef).then((snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        Object.entries(data).forEach(([id, note]) => {
          if (note.expiresAt && note.expiresAt < Date.now()) {
            remove(ref(db, `notes/${id}`));
          }
        });
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const [selectedNote, setSelectedNote] = useState(null);

  const [cloudMode, setCloudMode] = useState('clustered');

  return (
    <div className="App">
      <header className="App-header">
        <div className="titleDiv">
          <a href="#" className="title">Advice Wall</a>
        </div>
        <button className="add" onClick={handleOpen}><span className="material-symbols-outlined">add</span></button>
        <AddDialog open={dialogOpen} onClose={handleClose} />
        <SelectedNote selectedNote={selectedNote} setSelectedNote={setSelectedNote} />
      </header>
      <div className="notesMap">
        <NoteCloud notes={notes} setSelectedNote={setSelectedNote} />
      </div>
      <div className="cloudSelector">
        <CloudSelector cloudMode={cloudMode} setCloudMode={setCloudMode}/>
      </div>
    </div>
  );
}

export function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

export default App;
