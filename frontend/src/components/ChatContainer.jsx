import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Box, TextField, IconButton, Typography, Paper, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Send, ChatBubbleOutline, ArrowBack, Delete, Reply, Close } from '@mui/icons-material';
import '../styles/ChatContainer.scss';

const ChatContainer = () => {
    const { messages, selectedUser, getMessages, sendMessage, setSelectedUser, deleteMessage } = useChatStore();
    const { authUser } = useAuthStore();
    const [text, setText] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});

    useEffect(() => {
        if (selectedUser) getMessages(selectedUser._id);
    }, [selectedUser, getMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const messageData = { text };
        if (replyingTo) {
            messageData.replyTo = replyingTo._id;
        }
        sendMessage(messageData);
        setText('');
        setReplyingTo(null);
    };

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        setSelectedMessage(message);
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleCloseMenu = () => {
        setContextMenu(null);
    };

    const handleDeleteClick = () => {
        setDeleteDialog(true);
        handleCloseMenu();
    };

    const handleReplyClick = () => {
        setReplyingTo(selectedMessage);
        handleCloseMenu();
    };

    const handleConfirmDelete = () => {
        deleteMessage(selectedMessage._id);
        setDeleteDialog(false);
        setSelectedMessage(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialog(false);
        setSelectedMessage(null);
    };

    const scrollToMessage = (messageId) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('message--highlight');
            setTimeout(() => element.classList.remove('message--highlight'), 2000);
        }
    };

    if (!selectedUser) {
        return (
            <Box className="chat-container__empty">
                <ChatBubbleOutline />
                <Typography>Select a user to start chatting</Typography>
            </Box>
        );
    }

    return (
        <Box className="chat-container">
            <Paper className="chat-container__header" elevation={0}>
                <IconButton onClick={() => setSelectedUser(null)} className="chat-container__back-btn">
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6">{selectedUser.fullName}</Typography>
            </Paper>
            
            <Box className="chat-container__messages">
                {messages.map((message) => (
                    <Box
                        key={message._id}
                        ref={(el) => messageRefs.current[message._id] = el}
                        className={`message message--${message.senderId === authUser._id ? 'sent' : 'received'}`}
                        onContextMenu={(e) => handleContextMenu(e, message)}
                    >
                        <Box className={`message__bubble message__bubble--${message.senderId === authUser._id ? 'sent' : 'received'}`}>
                            {message.replyTo && (
                                <Box 
                                    className="message__reply-preview"
                                    onClick={() => scrollToMessage(message.replyTo._id)}
                                >
                                    <Reply fontSize="small" />
                                    <Typography variant="caption">
                                        {message.replyTo.text?.substring(0, 50)}
                                        {message.replyTo.text?.length > 50 ? '...' : ''}
                                    </Typography>
                                </Box>
                            )}
                            <Typography component="p">{message.text}</Typography>
                        </Box>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {replyingTo && (
                <Box className="chat-container__reply-bar">
                    <Box className="chat-container__reply-content">
                        <Reply fontSize="small" />
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#007185' }}>
                                Replying to {replyingTo.senderId === authUser._id ? 'yourself' : selectedUser.fullName}
                            </Typography>
                            <Typography variant="body2" noWrap>
                                {replyingTo.text}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyingTo(null)}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            )}
            
            <form onSubmit={handleSubmit} className="chat-container__input-form">
                <TextField
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                />
                <IconButton type="submit" color="primary" disabled={!text.trim()}>
                    <Send />
                </IconButton>
            </form>

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseMenu}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
            >
                <MenuItem onClick={handleReplyClick}>
                    <Reply fontSize="small" sx={{ mr: 1 }} />
                    Reply
                </MenuItem>
                {selectedMessage?.senderId === authUser._id && (
                    <MenuItem onClick={handleDeleteClick}>
                        <Delete fontSize="small" sx={{ mr: 1 }} />
                        Delete Message
                    </MenuItem>
                )}
            </Menu>

            <Dialog open={deleteDialog} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Message</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this message?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} sx={{ color: '#565959' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        sx={{ 
                            background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
                            color: '#0f1111',
                            '&:hover': {
                                background: 'linear-gradient(to bottom, #f5d78e, #edb933)'
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatContainer;
