import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { Logout, Chat } from '@mui/icons-material';
import '../styles/Sidebar.scss';

const Sidebar = () => {
    const { users, selectedUser, setSelectedUser } = useChatStore();
    const { logout, onlineUsers } = useAuthStore();

    return (
        <Box className="sidebar">
            <Box className="sidebar__header">
                <Typography variant="h6" component="h3">
                    <Chat /> Chats
                </Typography>
                <IconButton onClick={logout} color="inherit" size="small">
                    <Logout />
                </IconButton>
            </Box>
            
            <Box className="sidebar__users">
                {users.map((user) => (
                    <Box
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`sidebar__user ${selectedUser?._id === user._id ? 'sidebar__user--active' : ''}`}
                    >
                        <Box className="sidebar__user-avatar">
                            <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48, fontSize: 20 }}>
                                {user.fullName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box className={`sidebar__user-status sidebar__user-status--${onlineUsers.includes(user._id) ? 'online' : 'offline'}`} />
                        </Box>
                        <Box className="sidebar__user-info">
                            <Typography variant="subtitle1" component="h4">{user.fullName}</Typography>
                            <Typography variant="caption" component="p">
                                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Sidebar;
