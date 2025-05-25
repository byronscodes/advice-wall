
function NotesList({ notes, setSelectedNote }) {
  return (
    <div className="notes-list">
      {notes.map(note => (
        <div key={note.id} className="note" onClick={() => setSelectedNote(note)}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}

export default NotesList;