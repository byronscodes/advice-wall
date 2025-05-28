import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import React, { useState, useEffect } from 'react';
import { format } from 'timeago.js';

import { getDeviceId } from './App';
import { getDatabase, ref, update, get, remove, onValue } from "firebase/database";


// Likes note function
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

// Dislikes note function
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
    // State to hold the live note data
    const [liveNote, setLiveNote] = useState(null);

    // Effect to fetch the live note data from Firebase when selectedNote changes
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

    // State to hold the time left for the note
    const [timeLeft, setTimeLeft] = useState(1);

    // Effect to update the time left and handle note expiration
    useEffect(() => {
        if (!liveNote?.expiresAt) return;

        const updateTimeLeft = () => {
            const now = Date.now();
            const remaining = Math.max(0, liveNote.expiresAt - now);
            setTimeLeft(remaining);

            // If the time left is less than or equal to zero, remove the note
            if (remaining <= 0) {
                const db = getDatabase();
                remove(ref(db, 'notes/' + liveNote.id));
                setSelectedNote(null);
                setTimeLeft(1);
            }
        };

        updateTimeLeft();

        const interval = setInterval(updateTimeLeft, 60000);

        // Check if the note is not selected or if it has expired
        if (selectedNote === null) {
            clearInterval(interval);
            return;
        }

        return () => clearInterval(interval);
    }, [liveNote?.expiresAt, selectedNote])

    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    // State to manage the confirmation dialog for deletion
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div>
            {/* Confirmation dialog for deletion */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this note? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                        color="error"
                        onClick={() => {
                            const db = getDatabase();
                            remove(ref(db, 'notes/' + selectedNote?.id));
                            setConfirmOpen(false);
                            setSelectedNote(null);
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Main dialog for displaying the selected note */}
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
                            setConfirmOpen(true);
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
                        <DialogContentText
                            sx={{
                                position: 'absolute',
                                left: 12,
                                top: 10,
                                color: (theme) => theme.palette.grey[500],
                            }}>
                            {/* TIMER: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')} */}
                            {format(liveNote?.timestamp)}
                        </DialogContentText>
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
                        <span>{liveNote?.content}</span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div sx={{ display: 'flex' }}>
                        {liveNote?.likes?.voters?.[getDeviceId()] ? (
                            <IconButton
                                aria-label="like"
                                sx={{
                                    width: '60px',
                                    height: '60px',
                                }}
                                onClick={() => likeNote(liveNote.id)}>
                                <ArrowDropUpIcon sx={{ width: '40px', height: '40px', color: 'green' }} />
                            </IconButton>
                        ) : (
                            <IconButton
                                aria-label="like"
                                sx={{
                                    width: '60px',
                                    height: '60px',
                                }}
                                onClick={() => likeNote(liveNote.id)}>
                                <ArrowDropUpIcon sx={{ width: '40px', height: '40px', color: 'gray' }} />
                            </IconButton>
                        )}
                        <span style={{ display: 'inline-block', minWidth: 15, textAlign: 'center' }}>{liveNote?.likes.count - liveNote?.dislikes.count || 0}</span>
                        {liveNote?.dislikes?.voters?.[getDeviceId()] ? (
                            <IconButton
                                aria-label="like"
                                sx={{
                                    width: '60px',
                                    height: '60px',
                                }}
                                onClick={() => dislikeNote(liveNote.id)}>
                                <ArrowDropDownIcon sx={{ width: '40px', height: '40px', color: 'red' }} />
                            </IconButton>
                        ) : (
                            <IconButton
                                aria-label="like"
                                sx={{
                                    width: '60px',
                                    height: '60px',
                                }}
                                onClick={() => dislikeNote(liveNote.id)}>
                                <ArrowDropDownIcon sx={{ width: '40px', height: '40px', color: 'gray' }} />
                            </IconButton>
                        )}
                    </div>
                    {liveNote?.creator === getDeviceId() && (
                        <IconButton type="submit" color="error" sx={{ width: '60px', height: '60px' }}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}