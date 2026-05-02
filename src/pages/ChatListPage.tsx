import React, { useEffect, useState } from 'react';
import ChatItem from '@/src/components/chat-list/ChatItem';
import { Search } from 'lucide-react';

export default function ChatListPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/chats')
      .then(r => r.json())
      .then(data => {
        setChats(data);
        setLoading(false);
      });
  }, []);

  const filtered = chats.filter(c => 
    c.partner?.username.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-transparent pt-[env(safe-area-inset-top)]">
      {/* Header Sticky */}
      <div className="px-4 pt-10 pb-2 border-b border-ios-separator/30">
        <h1 className="text-[34px] font-bold tracking-tight mb-2 text-white">Chats</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1C1C1E] rounded-[10px] py-1.5 pl-9 pr-4 text-[17px] focus:outline-none text-white placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-20 sm:pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-[17px]">
            <p>No chats found</p>
          </div>
        ) : (
          filtered.map((c, index) => (
            <ChatItem 
              key={c.id}
              id={c.id}
              name={c.partner?.username || 'Unknown'}
              avatar={c.partner?.avatar || ''}
              lastMessage={c.lastMessage?.content || ''}
              timestamp={c.lastMessage?.createdAt || c.updatedAt}
              status={c.lastMessage?.status}
              isMe={c.lastMessage?.senderId === 'u1'}
              unreadCount={c.unreadCount}            
            />
          ))
        )}
      </div>
    </div>
  );
}
