import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

import { getDeviceId } from './App';
import { getDatabase, ref, update, get, remove } from "firebase/database";

function likeNote(noteId) {
    const db = getDatabase();
    const deviceId = getDeviceId();
    const likesRef = ref(db, 'notes/' + noteId + '/likes');
    get(likesRef).then((snapshot) => {
        const data = snapshot.val() || {};
        const currentCount = data.count || 0;
        const voters = data.voters || {};
        if (voters[deviceId]) {
            update(likesRef, {
                [`count`]: currentCount - 1,
                [`voters/${deviceId}`]: null
            });
        }
        else {
            update(likesRef, {
                [`count`]: currentCount + 1,
                [`voters/${deviceId}`]: true
            });
        }
    });
}

export default function SelectedNote({ selectedNote, setSelectedNote }) {
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
                    {selectedNote?.title}
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
                    <p>{selectedNote?.content}</p>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {selectedNote?.voters?.[getDeviceId()] ? (
                <Button onClick={() => likeNote(selectedNote.id)}>
                    <span className="material-symbols-outlined" style={{ color: 'green' }}>
                    arrow_drop_up
                    </span>
                    <span>{selectedNote?.likes?.count || 0}</span>
                </Button>
                ) : (
                <Button onClick={() => likeNote(selectedNote.id)}>
                    <span className="material-symbols-outlined" style={{ color: 'gray' }}>
                    arrow_drop_up
                    </span>
                    <span>{selectedNote?.likes?.count || 0}</span>
                </Button>
                )}
                {selectedNote?.creator === getDeviceId() && (
                    <Button type="submit" color="error">
                        <DeleteIcon />
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}