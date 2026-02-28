import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import '../styles/HomePage.scss';

const HomePage = () => {
    const { getUsers, connectSocket, disconnectSocket, selectedUser } = useChatStore();

    useEffect(() => {
        getUsers();
        connectSocket();
        return () => disconnectSocket();
    }, [getUsers, connectSocket, disconnectSocket]);

    return (
        <Box className="home-page">
            <Box className={`home-page__sidebar ${selectedUser ? 'home-page__sidebar--hidden' : ''}`}>
                <Sidebar />
            </Box>
            <Box className={`home-page__chat ${!selectedUser ? 'home-page__chat--hidden' : ''}`}>
                <ChatContainer />
            </Box>
        </Box>
    );
};

export default HomePage;
