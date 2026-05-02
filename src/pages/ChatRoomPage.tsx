import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MoreVertical, Paperclip, Send, Mic, Sparkles, X } from 'lucide-react';
import { useSocket } from '@/src/contexts/SocketContext';
import MessageBubble from '@/src/components/chat-room/MessageBubble';
import { cn } from '@/src/lib/utils';
import { useSettings } from '@/src/contexts/SettingsContext';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  const { speakMessage } = useSettings();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetch(`/api/chats`) // Quick hack to get partner info, in real app a specific endpoint is better
      .then(r => r.json())
      .then(data => {
        const c = data.find((x:any) => x.id === chatId);
        if (c) setPartner(c.partner);
      });

    fetch(`/api/chats/${chatId}/messages`)
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      });
  }, [chatId]);

  // Realtime events
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMsg = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      if (autoScroll) setTimeout(scrollToBottom, 50);
      // Mark as read
      socket.emit('message:read', { messageId: msg.id });
    };

    const handleAck = (data: any) => {
      setMessages(prev => prev.map(m => m.id === data.localTempId ? data.newMsg : m));
    };

    const handleUpdate = (data: any) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, status: data.status } : m));
    };

    const handleTyping = (data: any) => {
      if (data.chatId === chatId) setIsTyping(data.isTyping);
    };

    socket.on('message:new', handleNewMsg);
    socket.on('message:ack', handleAck);
    socket.on('message:update', handleUpdate);
    socket.on('typing:status', handleTyping);

    return () => {
      socket.off('message:new', handleNewMsg);
      socket.off('message:ack', handleAck);
      socket.off('message:update', handleUpdate);
      socket.off('typing:status', handleTyping);
    };
  }, [socket, chatId, autoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 50;
    setAutoScroll(isBottom);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      content: inputText,
      senderId: 'u1',
      chatId,
      status: 'sending',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    socket?.emit('message:send', { chatId, content: inputText, localTempId: tempId });
    setInputText('');
    socket?.emit('typing:stop', { chatId });
    setTimeout(scrollToBottom, 50);
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    socket?.emit('typing:start', { chatId });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing:stop', { chatId });
    }, 2000);
  };

  const handleSummarize = async () => {
    if (messages.length === 0) return;
    setShowSummaryModal(true);
    setIsSummarizing(true);
    setSummary('');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please summarize the following chat messages in a concise paragraph:\n\n${messages.map(m => `${m.senderId === 'u1' ? 'Me' : partner?.username || 'Partner'}: ${m.content}`).join('\n')}`,
      });
      setSummary(response.text || 'No summary could be generated.');
    } catch (error) {
      console.error('Summarize error:', error);
      setSummary('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const isPartnerOnline = partner && onlineUsers[partner.id];

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-ios-bg relative overflow-hidden pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-ios-separator/30 bg-ios-surface/80 backdrop-blur-xl shrink-0 z-10 sticky top-0 h-12">
        <button onClick={() => navigate('/chats')} className="flex items-center text-ios-blue px-2 hover:opacity-80 pb-0.5">
          <ChevronLeft size={28} strokeWidth={2.5} className="-ml-2" />
          <span className="text-[17px]">Chats</span>
        </button>
          
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="flex items-center gap-1.5">
            <img src={partner?.avatar || undefined} className="w-5 h-5 rounded-full object-cover bg-white/10" />
            <span className="font-semibold text-[15px]">{partner?.username || '...'}</span>
          </div>
          {isTyping ? (
            <span className="text-[11px] text-ios-blue animate-pulse">typing...</span>
          ) : isPartnerOnline ? (
            <span className="text-[11px] text-gray-400">online</span>
          ) : (
            <span className="text-[11px] text-gray-400">offline</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-ios-blue px-2">
          <button onClick={handleSummarize} className="hover:opacity-80 text-ios-blue" title="Summarize with AI">
            <Sparkles size={22} strokeWidth={1.5} />
          </button>
          <button className="hover:opacity-80"><Phone size={22} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-[#2C2C2E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-ios-blue flex items-center gap-2"><Sparkles size={16} /> AI Summary</h3>
            <button onClick={() => setShowSummaryModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
          </div>
          {isSummarizing ? (
             <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
              Generating summary...
            </div>
           ) : (
            <p className="text-[15px] text-white leading-relaxed">{summary}</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col gap-1 pb-4 bg-ios-bg"
      >
        {messages.map((m, i) => {
          const isMe = m.senderId === 'u1';
          const prevMsg = messages[i - 1];
          // Show avatar if previous message was not from same sender
          const showAvatar = !prevMsg || prevMsg.senderId !== m.senderId;
          
          return (
            <div key={m.id} className={showAvatar ? "mt-3" : ""}>
              <MessageBubble 
                msg={m} 
                isMe={isMe} 
                showAvatar={showAvatar} 
                partnerAvatar={partner?.avatar}
                onLongPress={(msg) => speakMessage(msg.content, isMe ? 'You' : partner?.username)}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="relative px-3 py-2 bg-[#1C1C1E]/95 backdrop-blur-lg border-t border-ios-separator/50 pb-[max(env(safe-area-inset-bottom),12px)]">
        <form onSubmit={handleSend} className="flex items-end gap-2.5 z-50 relative mt-1">
          <button type="button" className="p-1 mb-1 text-gray-400 hover:text-white transition-colors shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex flex-col items-center justify-center">
               <Paperclip size={18} />
            </div>
          </button>
          
          <div className="flex-1 bg-black border border-white/10 rounded-2xl flex items-center px-3 min-h-[38px] mb-[2px]">
            <input 
              type="text" 
              placeholder="Message" 
              value={inputText}
              onChange={handleTypingChange}
              className="w-full bg-transparent py-1.5 text-[17px] focus:outline-none text-white placeholder-gray-500"
            />
          </div>
          
          {inputText.trim() ? (
            <button type="submit" className="shrink-0 mb-1 flex items-center justify-center w-[34px] h-[34px] bg-ios-blue text-white rounded-full shadow-sm hover:opacity-80 transition-opacity">
              <Send size={16} className="-ml-0.5" />
            </button>
          ) : (
            <button type="button" className="p-1 mb-1 text-ios-blue hover:opacity-80 transition-opacity shrink-0">
               <Mic size={24} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
