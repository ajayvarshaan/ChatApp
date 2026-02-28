import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useGroupStore } from '../store/useGroupStore';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import '../styles/HomePage.scss';

const HomePage = () => {
    const { getUsers, connectSocket, disconnectSocket, selectedUser } = useChatStore();
    const { getGroups, selectedGroup } = useGroupStore();

    useEffect(() => {
        getUsers();
        getGroups();
        connectSocket();
        return () => disconnectSocket();
    }, [getUsers, getGroups, connectSocket, disconnectSocket]);

    return (
        <Box className="home-page">
            <Box className={`home-page__sidebar ${(selectedUser || selectedGroup) ? 'home-page__sidebar--hidden' : ''}`}>
                <Sidebar />
            </Box>
            <Box className={`home-page__chat ${(!selectedUser && !selectedGroup) ? 'home-page__chat--hidden' : ''}`}>
                <ChatContainer />
            </Box>
        </Box>
    );
};

export default HomePage;
