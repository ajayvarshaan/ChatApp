import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useGroupStore } from '../store/useGroupStore';
import { useAuthStore } from '../store/useAuthStore';
import { Box, TextField, IconButton, Typography, Paper, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from '@mui/material';
import { Send, ChatBubbleOutline, ArrowBack, Delete, Reply, Close, Edit, AttachFile, Image as ImageIcon, Info } from '@mui/icons-material';
import GroupMembersDialog from './GroupMembersDialog';
import '../styles/ChatContainer.scss';

const ChatContainer = () => {
    const { messages, selectedUser, getMessages, sendMessage, setSelectedUser, deleteMessage, editMessage, emitTyping, emitStopTyping, typingUsers } = useChatStore();
    const { groupMessages, selectedGroup, getGroupMessages, sendGroupMessage, setSelectedGroup } = useGroupStore();
    const { authUser } = useAuthStore();
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [editText, setEditText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [membersDialogOpen, setMembersDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (selectedUser) getMessages(selectedUser._id);
        if (selectedGroup) getGroupMessages(selectedGroup._id);
    }, [selectedUser, selectedGroup, getMessages, getGroupMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, groupMessages]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.querySelector('.chat-container__header input')?.focus();
            }
            if (e.key === 'Escape') {
                setSearchQuery('');
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !selectedFile) return;
        const messageData = {};
        if (text.trim()) messageData.text = text;
        if (replyingTo) messageData.replyTo = replyingTo._id;
        if (selectedFile) messageData.file = selectedFile;
        
        if (selectedGroup) {
            sendGroupMessage(selectedGroup._id, messageData);
        } else {
            sendMessage(messageData);
            emitStopTyping(selectedUser._id);
        }
        
        setText('');
        setSelectedFile(null);
        setReplyingTo(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        
        if (!selectedUser) return;
        
        emitTyping(selectedUser._id);
        
        if (typingTimeout) clearTimeout(typingTimeout);
        
        const timeout = setTimeout(() => {
            emitStopTyping(selectedUser._id);
        }, 1000);
        
        setTypingTimeout(timeout);
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

    const handleEditClick = () => {
        setEditText(selectedMessage.text);
        setEditDialog(true);
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

    const handleConfirmEdit = () => {
        if (editText.trim() && editText !== selectedMessage.text) {
            editMessage(selectedMessage._id, editText);
        }
        setEditDialog(false);
        setSelectedMessage(null);
        setEditText('');
    };

    const handleCancelEdit = () => {
        setEditDialog(false);
        setSelectedMessage(null);
        setEditText('');
    };

    const scrollToMessage = (messageId) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('message--highlight');
            setTimeout(() => element.classList.remove('message--highlight'), 2000);
        }
    };

    if (!selectedUser && !selectedGroup) {
        return (
            <Box className="chat-container__empty">
                <ChatBubbleOutline />
                <Typography>Select a user or group to start chatting</Typography>
            </Box>
        );
    }

    const currentMessages = selectedGroup ? groupMessages : messages;
    const chatName = selectedGroup ? selectedGroup.name : selectedUser?.fullName;
    const chatAvatar = selectedGroup ? null : selectedUser?.profilePic;

    const filteredMessages = currentMessages.filter(msg => 
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box 
            className="chat-container"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <Box className="chat-container__drag-overlay">
                    <Typography variant="h5">Drop file to upload</Typography>
                </Box>
            )}
            <Paper className="chat-container__header" elevation={0}>
                <IconButton onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} className="chat-container__back-btn">
                    <ArrowBack />
                </IconButton>
                {chatAvatar && (
                    <Avatar src={chatAvatar} sx={{ width: 40, height: 40, mr: 2 }}>
                        {chatName?.charAt(0).toUpperCase()}
                    </Avatar>
                )}
                {!chatAvatar && (
                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#667eea' }}>
                        {chatName?.charAt(0).toUpperCase()}
                    </Avatar>
                )}
                <Typography variant="h6" sx={{ flex: 1 }}>{chatName}</Typography>
                <TextField
                    size="small"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 200, mr: 1 }}
                />
                {selectedGroup && (
                    <IconButton onClick={() => setMembersDialogOpen(true)} color="primary">
                        <Info />
                    </IconButton>
                )}
            </Paper>
            
            <Box className="chat-container__messages">
                {filteredMessages.map((message) => (
                    <Box
                        key={message._id}
                        ref={(el) => messageRefs.current[message._id] = el}
                        className={`message message--${message.senderId === authUser._id ? 'sent' : 'received'}`}
                        onContextMenu={(e) => handleContextMenu(e, message)}
                    >
                        <Box className={`message__bubble message__bubble--${message.senderId === authUser._id || message.senderId?._id === authUser._id ? 'sent' : 'received'}`}>
                            {selectedGroup && message.senderId?._id !== authUser._id && (
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#007185', display: 'block', mb: 0.5 }}>
                                    {message.senderId?.fullName}
                                </Typography>
                            )}
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
                            {message.fileUrl && (
                                <Box className="message__file">
                                    {message.fileType?.startsWith('image/') ? (
                                        <img src={message.fileUrl} alt={message.fileName} className="message__image" />
                                    ) : (
                                        <a href={message.fileUrl} download={message.fileName} className="message__file-link">
                                            <AttachFile fontSize="small" />
                                            {message.fileName}
                                        </a>
                                    )}
                                </Box>
                            )}
                            {message.edited && (
                                <Typography variant="caption" className="message__edited">
                                    edited
                                </Typography>
                            )}
                            {message.senderId === authUser._id && (
                                <Typography variant="caption" className={`message__status ${message.read ? 'message__status--read' : ''}`}>
                                    <span className="checkmark">✓</span>
                                    <span className="checkmark">✓</span>
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
                {typingUsers[selectedUser?._id] && (
                    <Box className="message message--received">
                        <Box className="message__bubble message__bubble--received">
                            <Typography component="p" className="typing-indicator">
                                <span></span><span></span><span></span>
                            </Typography>
                        </Box>
                    </Box>
                )}
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

            {selectedFile && (
                <Box className="chat-container__file-preview">
                    <Typography variant="caption">
                        {selectedFile.name}
                    </Typography>
                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            )}
            
            <form onSubmit={handleSubmit} className="chat-container__input-form">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                />
                <IconButton onClick={() => fileInputRef.current?.click()} color="primary">
                    <AttachFile />
                </IconButton>
                <TextField
                    fullWidth
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                />
                <IconButton type="submit" color="primary" disabled={!text.trim() && !selectedFile}>
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
                    <>
                        <MenuItem onClick={handleEditClick}>
                            <Edit fontSize="small" sx={{ mr: 1 }} />
                            Edit Message
                        </MenuItem>
                        <MenuItem onClick={handleDeleteClick}>
                            <Delete fontSize="small" sx={{ mr: 1 }} />
                            Delete Message
                        </MenuItem>
                    </>
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

            <Dialog open={editDialog} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Message</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit} sx={{ color: '#565959' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmEdit}
                        disabled={!editText.trim()}
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
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <GroupMembersDialog 
                open={membersDialogOpen} 
                onClose={() => setMembersDialogOpen(false)} 
                group={selectedGroup} 
            />
        </Box>
    );
};

export default ChatContainer;
