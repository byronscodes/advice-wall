import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { getDatabase, ref, set, push } from "firebase/database";

export default function AddDialog({ open, onClose }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const content = formJson.content;
                        const title = formJson.title;
                        const db = getDatabase();
                        const notesRef = ref(db, 'notes');
                        push(notesRef, {
                            content: content,
                            title: title,
                            timestamp: Date.now()
                        });
                        onClose();
                    },
                },
            }}
        >
            <DialogTitle>New Note</DialogTitle>
            <DialogContent>
                <TextField
                    name="title"
                    label="Optional Title"
                    variant="standard"
                    fullWidth
                    margin="dense"
                />
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="content"
                    label="Content"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Submit</Button>
            </DialogActions>
        </Dialog>
    );
}