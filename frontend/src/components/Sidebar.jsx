import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useGroupStore } from '../store/useGroupStore';
import { Box, Typography, Avatar, IconButton, Tabs, Tab } from '@mui/material';
import { Logout, Chat, Person, GroupAdd, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreateGroupDialog from './CreateGroupDialog';
import SettingsDialog from './SettingsDialog';
import '../styles/Sidebar.scss';

const Sidebar = () => {
    const { users, selectedUser, setSelectedUser } = useChatStore();
    const { groups, selectedGroup, setSelectedGroup } = useGroupStore();
    const { logout, onlineUsers } = useAuthStore();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <Box className="sidebar">
            <Box className="sidebar__header">
                <Typography variant="h6" component="h3">
                    <Chat /> Chats
                </Typography>
                <Box>
                    <IconButton onClick={() => setCreateGroupOpen(true)} color="inherit" size="small">
                        <GroupAdd />
                    </IconButton>
                    <IconButton onClick={() => setSettingsOpen(true)} color="inherit" size="small">
                        <Settings />
                    </IconButton>
                    <IconButton onClick={() => navigate('/profile')} color="inherit" size="small">
                        <Person />
                    </IconButton>
                    <IconButton onClick={logout} color="inherit" size="small">
                        <Logout />
                    </IconButton>
                </Box>
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Chats" />
                <Tab label="Groups" />
            </Tabs>
            
            <Box className="sidebar__users">
                {tabValue === 0 ? (
                    users.map((user) => (
                        <Box
                            key={user._id}
                            onClick={() => { setSelectedUser(user); setSelectedGroup(null); }}
                            className={`sidebar__user ${selectedUser?._id === user._id ? 'sidebar__user--active' : ''}`}
                        >
                            <Box className="sidebar__user-avatar">
                                <Avatar 
                                    src={user.profilePic} 
                                    sx={{ bgcolor: '#667eea', width: 48, height: 48, fontSize: 20 }}
                                >
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
                            {user.unreadCount > 0 && (
                                <Box className="sidebar__unread-badge">
                                    {user.unreadCount}
                                </Box>
                            )}
                        </Box>
                    ))
                ) : (
                    groups.map((group) => (
                        <Box
                            key={group._id}
                            onClick={() => { setSelectedGroup(group); setSelectedUser(null); }}
                            className={`sidebar__user ${selectedGroup?._id === group._id ? 'sidebar__user--active' : ''}`}
                        >
                            <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48, fontSize: 20 }}>
                                {group.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box className="sidebar__user-info">
                                <Typography variant="subtitle1" component="h4">{group.name}</Typography>
                                <Typography variant="caption" component="p">
                                    {group.members.length} members
                                </Typography>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
            <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Box>
    );
};

export default Sidebar;
