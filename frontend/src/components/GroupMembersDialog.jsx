import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

const GroupMembersDialog = ({ open, onClose, group }) => {
    if (!group) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Group Members ({group.members?.length || 0})</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List>
                    {group.members?.map((member) => (
                        <ListItem key={member._id}>
                            <ListItemAvatar>
                                <Avatar src={member.profilePic} sx={{ bgcolor: '#667eea' }}>
                                    {member.fullName?.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={member.fullName}
                                secondary={member._id === group.admin?._id || member._id === group.admin ? 'Admin' : 'Member'}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default GroupMembersDialog;
