import React from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  msg: any;
  isMe: boolean;
  showAvatar: boolean;
  partnerAvatar?: string;
  onLongPress?: (msg: any) => void;
}

export default function MessageBubble({ msg, isMe, showAvatar, partnerAvatar, onLongPress }: MessageBubbleProps) {
  
  // Format time (e.g. 10:45 AM)
  const time = new Date(msg.createdAt);
  const timeStr = isNaN(time.getTime()) ? '' : format(time, 'h:mm a');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, originY: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex gap-2 mb-0.5 w-full", isMe ? "justify-end" : "justify-start")}
    >
      {!isMe && showAvatar && (
        <div className="shrink-0 w-7 flex items-end">
          <img src={partnerAvatar || undefined} alt="" className="w-7 h-7 rounded-full bg-white/10" />
        </div>
      )}
      {!isMe && !showAvatar && <div className="w-7 shrink-0" />} 

      <div 
        className={cn(
          "group relative flex flex-col max-w-[75%] px-3.5 py-2",
          isMe ? "rounded-[20px] rounded-br-[4px] bg-ios-blue text-white" 
               : "rounded-[20px] rounded-bl-[4px] bg-[#2C2C2E] text-white"
        )}
        onContextMenu={(e) => { e.preventDefault(); onLongPress?.(msg); }}
      >
        <p className="text-[17px] leading-[22px] break-words">{msg.content}</p>
        
        <div className={cn(
          "flex items-center gap-1 mt-0.5 text-[11px] select-none opacity-60",
          isMe ? "justify-end text-white" : "justify-start text-white"
        )}>
          <span>{timeStr}</span>
          {isMe && msg.status === 'sent' && <Check size={12} />}
          {isMe && msg.status === 'delivered' && <CheckCheck size={12} />}
          {isMe && msg.status === 'read' && <CheckCheck size={12} className="text-white opacity-100" />}
        </div>
      </div>
    </motion.div>
  );
}
