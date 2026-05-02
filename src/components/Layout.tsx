import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useSettings } from '@/src/contexts/SettingsContext';

export default function Layout() {
  const { textSize, glassIntensity } = useSettings();
  const location = useLocation();

  // Glass class maps
  const glassClasses = {
    low: 'bg-[#0B0D10]/80 border-white/[0.04] backdrop-blur-[6px]',
    medium: 'bg-[#0B0D10]/60 border-white/[0.08] backdrop-blur-[12px]',
    high: 'bg-[#0B0D10]/40 border-white/[0.12] backdrop-blur-[18px]',
  };
  
  const textClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  const isChatRoom = Boolean(location.pathname.match(/^\/chats\/[^/]+$/));

  // Prevent routing mismatch by forcing theme layout across the app
  return (
    <div className={cn(
      "flex h-[100dvh] w-full bg-ios-bg text-white overflow-hidden font-sans",
      textClasses[textSize]
    )}>
      {/* Background gradients for soft glass effect - kept very minimal for iOS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ios-blue/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 flex w-full h-full flex-col sm:flex-row sm:p-2 md:p-4 lg:gap-4 lg:p-6 lg:max-w-7xl lg:mx-auto">
        
        {/* Desktop Sidebar / Mobile Tab Bar */}
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 sm:relative flex sm:flex-col justify-between sm:justify-start items-center sm:items-stretch sm:rounded-2xl border-t border-ios-separator/50 sm:border z-50 transition-all duration-300 ease-in-out transform flex-shrink-0 overflow-hidden bg-ios-surface/85 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),12px)] sm:pb-0",
          glassClasses[glassIntensity],
          isChatRoom 
            ? "translate-y-full opacity-0 pointer-events-none sm:translate-y-0 sm:-translate-x-full sm:w-0 sm:border-none sm:opacity-0" 
            : "translate-y-0 opacity-100 sm:translate-x-0 sm:w-20 md:w-64 sm:opacity-100"
        )}>
          <div className="flex sm:flex-col w-full h-full sm:h-auto px-2 sm:px-2 py-2 sm:py-0 justify-around sm:justify-start overflow-y-auto overflow-x-hidden md:min-w-[16rem]">
            {/* Logo */}
            <div className="hidden sm:flex items-center gap-3 p-4 mb-4 border-b border-ios-separator">
              <div className="w-8 h-8 rounded-full bg-ios-blue flex items-center justify-center shrink-0">
                <MessageSquare size={16} fill="white" />
              </div>
              <span className="font-semibold hidden md:block whitespace-nowrap overflow-hidden text-[17px]">Chats</span>
            </div>

            <div className="flex sm:flex-col w-full flex-1 sm:flex-none justify-around sm:justify-start">
              <NavItem to="/chats" icon={<MessageSquare size={24} />} label="Chats" active={location.pathname === '/chats'} />
              <NavItem to="/contacts" icon={<Users size={24} />} label="Contacts" active={location.pathname.startsWith('/contacts')} />
              <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" active={location.pathname.startsWith('/settings')} />
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 relative flex flex-col h-full sm:rounded-2xl border-x-0 sm:border border-ios-separator overflow-hidden transition-all duration-300 bg-ios-bg",
          glassClasses[glassIntensity]
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col sm:flex-row items-center sm:gap-3 px-2 py-0.5 sm:px-3 sm:py-3 rounded-xl transition-all duration-200",
        (isActive || active) 
          ? "text-ios-blue sm:bg-white/5" 
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      )}
    >
      <div className={cn("transition-transform duration-200", active && "scale-105 sm:scale-100")}>
        {React.cloneElement(icon as React.ReactElement, {
          fill: active ? "currentColor" : "none"
        })}
      </div>
      <span className="text-[10px] sm:text-[17px] font-medium leading-none mt-1 sm:mt-0 md:block hidden sm:block">{label}</span>
      <span className="text-[10px] font-medium leading-none mt-1 md:hidden sm:hidden block">{label}</span>
      
    </NavLink>
  );
}
