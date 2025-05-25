import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect } from 'react';

import { getDeviceId } from './App';
import { getDatabase, ref, update, get, remove, onValue } from "firebase/database";

function likeNote(noteId) {
    const db = getDatabase();
    const deviceId = getDeviceId();
    const noteRef = ref(db, 'notes/' + noteId);
    get(noteRef).then((snapshot) => {
        const data = snapshot.val() || {};
        const likeCount = data.likes.count || 0;
        const dislikeCount = data.dislikes.count || 0;
        const dislikeVoters = data.dislikes.voters || {};
        const likeVoters = data.likes.voters || {};
        const dislikesRef = ref(db, 'notes/' + noteId + '/dislikes');
        const likesRef = ref(db, 'notes/' + noteId + '/likes');
        if (likeVoters[deviceId]) {
            update(likesRef, {
                [`count`]: Math.max(likeCount - 1, 0),
                [`voters/${deviceId}`]: null
            });
        }
        else if (dislikeVoters[deviceId]) {
            update(dislikesRef, {
                [`count`]: Math.max(dislikeCount - 1, 0),
                [`voters/${deviceId}`]: null
            });
            update(likesRef, {
                [`count`]: likeCount + 1,
                [`voters/${deviceId}`]: true
            });
        }
        else {
            update(likesRef, {
                [`count`]: likeCount + 1,
                [`voters/${deviceId}`]: true
            });
        }
    });
}

function dislikeNote(noteId) {
    const db = getDatabase();
    const deviceId = getDeviceId();
    const noteRef = ref(db, 'notes/' + noteId);
    get(noteRef).then((snapshot) => {
        const data = snapshot.val() || {};
        const likeCount = data.likes.count || 0;
        const dislikeCount = data.dislikes.count || 0;
        const dislikeVoters = data.dislikes.voters || {};
        const likeVoters = data.likes.voters || {};
        const dislikesRef = ref(db, 'notes/' + noteId + '/dislikes');
        const likesRef = ref(db, 'notes/' + noteId + '/likes');
        if (dislikeVoters[deviceId]) {
            update(dislikesRef, {
                [`count`]: Math.max(dislikeCount - 1, 0),
                [`voters/${deviceId}`]: null
            });
        }
        else if (likeVoters[deviceId]) {
            update(likesRef, {
                [`count`]: Math.max(likeCount - 1, 0),
                [`voters/${deviceId}`]: null
            });
            update(dislikesRef, {
                [`count`]: dislikeCount + 1,
                [`voters/${deviceId}`]: true
            });
        }
        else {
            update(dislikesRef, {
                [`count`]: dislikeCount + 1,
                [`voters/${deviceId}`]: true
            });
        }
    });
}

export default function SelectedNote({ selectedNote, setSelectedNote }) {
    const [liveNote, setLiveNote] = useState(null);

    useEffect(() => {
        if (!selectedNote?.id) return;
        const db = getDatabase();
        const noteref = ref(db, 'notes/' + selectedNote?.id);

        const unsubscribe = onValue(noteref, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLiveNote({ id: selectedNote.id, ...data });
            }
        });
        return () => unsubscribe();
    }, [selectedNote?.id]);

    useEffect(() => {
        console.log("Rendering with liveNote:", liveNote);
    }, [liveNote]);


    return (
        <Dialog
            open={selectedNote !== null}
            onClose={() => setSelectedNote(null)}
            className="selectedNote"
            transitionDuration={0}
            slotProps={{
                container: {
                    sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                },
                paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const db = getDatabase();
                        remove(ref(db, 'notes/' + selectedNote?.id))
                        setSelectedNote(null);
                    },
                    sx: {
                        width: 'clamp(300px, 45vw, 550px)',
                        height: 'clamp(200px, 45vh, 500px)',

                    }
                },
            }}

        >
            <DialogContent>
                <DialogTitle sx={{ textAlign: 'center' }}>
                    {liveNote?.title}
                    <IconButton
                        aria-label="close"
                        onClick={() => setSelectedNote(null)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContentText sx={{ textAlign: 'center' }}>
                    <p>{liveNote?.content}</p>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {liveNote?.likes?.voters?.[getDeviceId()] ? (
                    <Button onClick={() => likeNote(liveNote.id)}>
                        <span className="material-symbols-outlined" style={{ color: 'green' }}>
                            arrow_drop_up
                        </span>
                        <span>{liveNote?.likes?.count || 0}</span>
                    </Button>
                ) : (
                    <Button onClick={() => likeNote(liveNote.id)}>
                        <span className="material-symbols-outlined" style={{ color: 'gray' }}>
                            arrow_drop_up
                        </span>
                        <span>{liveNote?.likes?.count || 0}</span>
                    </Button>
                )}
                {liveNote?.dislikes?.voters?.[getDeviceId()] ? (
                    <Button onClick={() => dislikeNote(liveNote.id)}>
                        <span className="material-symbols-outlined" style={{ color: 'red' }}>
                            arrow_drop_down
                        </span>
                        <span>{liveNote?.dislikes?.count || 0}</span>
                    </Button>
                ) : (
                    <Button onClick={() => dislikeNote(liveNote.id)}>
                        <span className="material-symbols-outlined" style={{ color: 'gray' }}>
                            arrow_drop_down
                        </span>
                        <span>{liveNote?.dislikes?.count || 0}</span>
                    </Button>
                )}
                {liveNote?.creator === getDeviceId() && (
                    <Button type="submit" color="error">
                        <DeleteIcon />
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}