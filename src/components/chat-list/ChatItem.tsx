import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Archive, BellOff, Pin, Trash2, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { useSettings } from '@/src/contexts/SettingsContext';

interface ChatItemProps {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  status: 'sent' | 'delivered' | 'read' | null;
  isMe: boolean;
  timestamp: string;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
}

const ActionIcon = ({ action, className }: { action: string, className?: string }) => {
  switch (action) {
    case 'archive': return <Archive size={20} className={className} />;
    case 'delete': return <Trash2 size={20} className={className} />;
    case 'mute': return <BellOff size={20} className={className} />;
    case 'pin': return <Pin size={20} className={className} />;
    default: return <Archive size={20} className={className} />;
  }
};

export default function ChatItem({
  id, name, avatar, lastMessage, status, isMe, timestamp, unreadCount, isPinned, isMuted
}: ChatItemProps) {
  const navigate = useNavigate();
  const { swipeLeftAction, swipeRightAction } = useSettings();
  const x = useMotionValue(0);
  
  // Opacities for swipe actions
  const rightBgOpacity = useTransform(x, [-100, -50], [1, 0]); // Shown when swipe left
  const leftBgOpacity = useTransform(x, [50, 100], [0, 1]); // Shown when swipe right

  const handleDragEnd = (e: any, info: any) => {
    const threshold = 80;
    if (info.offset.x < -threshold) {
      console.log('Action:', swipeLeftAction, id);
      // spring back for now
      animate(x, 0, { type: 'spring', bounce: 0.5 });
    } else if (info.offset.x > threshold) {
      console.log('Action:', swipeRightAction, id);
      animate(x, 0, { type: 'spring', bounce: 0.5 });
    } else {
      animate(x, 0, { type: 'spring', bounce: 0.5 });
    }
  };

  const handleLongPress = () => {
    // Implement Quick Preview
    console.log('Long press on', id);
  };

  // Format time
  let timeStr = '';
  try {
    timeStr = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    timeStr = timeStr.replace('about ', '').replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd');
  } catch(e) {}

  return (
    <div className="relative group overflow-hidden bg-ios-bg">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0">
        <motion.div style={{ opacity: leftBgOpacity }} className="flex items-center justify-start h-full pl-6 bg-ios-blue text-white w-1/2">
          <ActionIcon action={swipeRightAction} className="text-white" />
        </motion.div>
        
        <motion.div style={{ opacity: rightBgOpacity }} className="flex items-center justify-end h-full pr-6 bg-red-500 text-white w-1/2 ml-auto">
          <ActionIcon action={swipeLeftAction} className="text-white" />
        </motion.div>
      </div>

      {/* Main Content (Swipeable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => navigate(`/chats/${id}`)}
        className="relative z-10 flex items-center pl-4 bg-ios-bg cursor-pointer group-active:bg-[#1C1C1E] transition-colors"
      >
        <div 
          className="relative shrink-0 py-2"
          onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
        >
          <img src={avatar || undefined} alt={name} className="w-[52px] h-[52px] rounded-full object-cover bg-white/10" />
          {onlineStatusMock[id] && (
            <div className="absolute bottom-2 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-ios-bg rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0 ml-3 py-3 border-b border-ios-separator/50 flex flex-col justify-center pr-4 h-[76px]">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="font-semibold text-white truncate pr-2 flex items-center gap-2 text-[17px] leading-tight">
              {name}
              {isPinned && <Pin size={12} className="text-gray-500" />}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              {isMuted && <BellOff size={12} className="text-gray-500" />}
              <span className="text-[15px] font-medium text-gray-500 whitespace-nowrap leading-tight">{timeStr}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[15px] text-gray-400">
            {isMe && status === 'read' && <CheckCheck size={14} className="text-ios-blue" />}
            {isMe && status === 'delivered' && <CheckCheck size={14} />}
            {isMe && status === 'sent' && <Check size={14} />}
            <p className="truncate flex-1 max-w-[85%]">{lastMessage}</p>
          </div>
        </div>

        {unreadCount ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 w-[22px] h-[22px] rounded-full bg-ios-blue flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
            {unreadCount}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

// Temporary for prototype to show online ring
const onlineStatusMock: Record<string, boolean> = { c1: true, c2: false };
