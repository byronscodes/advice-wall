import './App.css';
import AddDialog from './AddDialog';
import NoteList from './NotesList';
import NoteCloud from './NoteCloud';
import D3NoteCloud from './D3NoteCloud';
import SelectedNote from './SelectedNote'
import CloudSelector from './CloudSelector';
import React, { useState, useEffect } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
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
        <D3NoteCloud notes={notes} setSelectedNote={setSelectedNote} cloudMode={cloudMode}/>
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
