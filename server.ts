import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// --- MOCK DATABASE ---
// In a real app, this is PostgreSQL + Redis
const db = {
  users: [
    { id: 'u1', username: 'Alex', avatar: 'https://i.pravatar.cc/150?u=u1', online: true },
    { id: 'u2', username: 'Sam', avatar: 'https://i.pravatar.cc/150?u=u2', online: false },
    { id: 'u3', username: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=u3', online: true },
  ],
  chats: [
    { id: 'c1', participants: ['u1', 'u2'], updatedAt: new Date().toISOString() },
    { id: 'c2', participants: ['u1', 'u3'], updatedAt: new Date().toISOString() },
  ],
  messages: [
    { id: 'm1', chatId: 'c1', senderId: 'u2', content: 'Hey Alex! How are things?', status: 'read', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', chatId: 'c1', senderId: 'u1', content: 'Hey Sam! Im good, just working on the new chat app prototype.', status: 'read', createdAt: new Date(Date.now() - 3500000).toISOString() },
    { id: 'm3', chatId: 'c2', senderId: 'u3', content: 'Did you check the latest glass UI designs?', status: 'delivered', createdAt: new Date(Date.now() - 60000).toISOString() },
  ],
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  app.use(express.json());

  // --- REST API ENDPOINTS ---
  app.get('/api/users/me', (req, res) => {
    // Mock authenticated user (always u1 for demo)
    res.json(db.users.find(u => u.id === 'u1'));
  });

  app.get('/api/chats', (req, res) => {
    const userId = 'u1'; // Mock Auth
    const userChats = db.chats.filter(c => c.participants.includes(userId));
    
    // Enrich chats with last message and partner info
    const enriched = userChats.map(c => {
      const partnerId = c.participants.find(p => p !== userId);
      const partner = db.users.find(u => u.id === partnerId);
      const chatMessages = db.messages.filter(m => m.chatId === c.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      return {
        ...c,
        partner,
        lastMessage
      };
    }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    res.json(enriched);
  });

  app.get('/api/chats/:id/messages', (req, res) => {
    const messages = db.messages
      .filter(m => m.chatId === req.params.id)
      .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(messages);
  });

  // --- WEBSOCKET LAYER ---
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || 'u1';
    
    // Join a global presence room for this user
    socket.join(`user:${userId}`);
    
    // Join chat rooms the user belongs to
    const userChats = db.chats.filter(c => c.participants.includes(userId));
    userChats.forEach(c => socket.join(`chat:${c.id}`));

    // Broadcast online status
    const me = db.users.find(u => u.id === userId);
    if(me) me.online = true;
    io.emit('user:presence', { userId, online: true });

    socket.on('message:send', (data) => {
      const newMsg = {
        id: `m_${Date.now()}`,
        chatId: data.chatId,
        senderId: userId,
        content: data.content,
        status: 'sent',
        createdAt: new Date().toISOString()
      };
      
      // Save to mock DB
      db.messages.push(newMsg);
      const chat = db.chats.find(c => c.id === data.chatId);
      if (chat) chat.updatedAt = newMsg.createdAt;
      
      // Acknowledge back to sender
      socket.emit('message:ack', { localTempId: data.localTempId, newMsg });
      
      // Broadcast to room
      socket.to(`chat:${data.chatId}`).emit('message:new', newMsg);
      
      // Simulate delivery notification after short delay
      setTimeout(() => {
        newMsg.status = 'delivered';
        io.to(`chat:${data.chatId}`).emit('message:update', { id: newMsg.id, status: 'delivered' });
      }, 500);
    });

    socket.on('message:read', (data) => {
      const msg = db.messages.find(m => m.id === data.messageId);
      if(msg && msg.senderId !== userId) {
        msg.status = 'read';
        io.to(`chat:${msg.chatId}`).emit('message:update', { id: msg.id, status: 'read' });
      }
    });

    socket.on('typing:start', (data) => {
      socket.to(`chat:${data.chatId}`).emit('typing:status', { chatId: data.chatId, userId, isTyping: true });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`chat:${data.chatId}`).emit('typing:status', { chatId: data.chatId, userId, isTyping: false });
    });

    socket.on('disconnect', () => {
      if(me) me.online = false;
      io.emit('user:presence', { userId, online: false });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
