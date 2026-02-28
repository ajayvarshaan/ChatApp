import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import { useChatStore } from '../store/useChatStore';
import { useGroupStore } from '../store/useGroupStore';

const CreateGroupDialog = ({ open, onClose }) => {
    const { users } = useChatStore();
    const { createGroup } = useGroupStore();
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleMemberToggle = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        try {
            await createGroup({ name: groupName, description, members: selectedMembers });
            setGroupName('');
            setDescription('');
            setSelectedMembers([]);
            onClose();
        } catch (error) {
            console.log('Error creating group:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    sx={{ mt: 2, mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    <FormGroup>
                        {users.map(user => (
                            <FormControlLabel
                                key={user._id}
                                control={
                                    <Checkbox
                                        checked={selectedMembers.includes(user._id)}
                                        onChange={() => handleMemberToggle(user._id)}
                                    />
                                }
                                label={user.fullName}
                            />
                        ))}
                    </FormGroup>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: '#565959' }}>Cancel</Button>
                <Button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || selectedMembers.length === 0}
                    sx={{
                        background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
                        color: '#0f1111',
                        '&:hover': {
                            background: 'linear-gradient(to bottom, #f5d78e, #edb933)'
                        },
                        '&:disabled': {
                            background: '#e7e7e7',
                            color: '#c4c4c4'
                        }
                    }}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateGroupDialog;
