import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/src/components/Layout';
import { SocketProvider } from '@/src/contexts/SocketContext';
import { SettingsProvider } from '@/src/contexts/SettingsContext';

// Pages
import ChatListPage from '@/src/pages/ChatListPage';
import ChatRoomPage from '@/src/pages/ChatRoomPage';
import SettingsPage from '@/src/pages/SettingsPage';

export default function App() {
  // Hardcoded mock user ID for prototype
  const userId = 'u1'; 

  return (
    <SettingsProvider>
      <SocketProvider userId={userId}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/chats" replace />} />
              <Route path="chats" element={<ChatListPage />} />
              <Route path="chats/:chatId" element={<ChatRoomPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<div className="p-8">Work in progress</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </SettingsProvider>
  );
}
