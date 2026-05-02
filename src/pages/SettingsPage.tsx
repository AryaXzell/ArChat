import React from 'react';
import { useSettings } from '@/src/contexts/SettingsContext';

export default function SettingsPage() {
  const { 
    textSize, setTextSize, 
    reduceMotion, setReduceMotion,
    glassIntensity, setGlassIntensity,
    swipeLeftAction, setSwipeLeftAction,
    swipeRightAction, setSwipeRightAction
  } = useSettings();

  return (
    <div className="flex flex-col h-full bg-ios-bg pt-[env(safe-area-inset-top)]">
      {/* Header Sticky */}
      <div className="px-4 pt-10 pb-2 border-b border-ios-separator/30 bg-ios-bg/80 backdrop-blur-xl z-10 sticky top-0">
        <h1 className="text-[34px] font-bold tracking-tight mb-2 text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:pb-6 custom-scrollbar">
        <div className="space-y-8 max-w-lg w-full">
          {/* Appearance Settings */}
          <section>
            <h3 className="text-[13px] font-normal text-gray-400 uppercase tracking-wide mb-2 px-4">Appearance</h3>
            
            <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden">
              <div className="flex flex-col gap-2 p-4 border-b border-ios-separator">
                <label className="text-[17px] text-white">Glass Intensity</label>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
                  {(['low', 'medium', 'high'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setGlassIntensity(level)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium capitalize transition-all ${glassIntensity === level ? 'bg-ios-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#1C1C1E]">
                <label className="text-[17px] text-white">Reduce Motion</label>
                <button 
                  onClick={() => setReduceMotion(!reduceMotion)}
                  className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors ${reduceMotion ? 'bg-[#34C759]' : 'bg-[#3A3A3C]'}`}
                >
                  <div className={`w-[27px] h-[27px] rounded-full bg-white transition-transform ${reduceMotion ? 'translate-x-5 shadow-sm' : 'translate-x-0 shadow-sm'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Accessibility Settings */}
          <section>
            <h3 className="text-[13px] font-normal text-gray-400 uppercase tracking-wide mb-2 px-4">Accessibility</h3>
            
            <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden">
              <div className="flex flex-col gap-2 p-4">
                <label className="text-[17px] text-white">Text Size</label>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
                  {(['small', 'default', 'large', 'xlarge'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setTextSize(size)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${textSize === size ? 'bg-ios-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Chat Gestures Settings */}
          <section>
            <h3 className="text-[13px] font-normal text-gray-400 uppercase tracking-wide mb-2 px-4">Chat Gestures</h3>
            
            <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden">
              <div className="flex flex-col gap-2 p-4 border-b border-ios-separator">
                <label className="text-[17px] text-white">Swipe Left</label>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl overflow-x-auto custom-scrollbar">
                  {(['archive', 'delete', 'mute', 'pin'] as const).map(action => (
                    <button
                      key={action}
                      onClick={() => setSwipeLeftAction(action)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${swipeLeftAction === action ? 'bg-ios-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <label className="text-[17px] text-white">Swipe Right</label>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl overflow-x-auto custom-scrollbar">
                  {(['archive', 'delete', 'mute', 'pin'] as const).map(action => (
                    <button
                      key={action}
                      onClick={() => setSwipeRightAction(action)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${swipeRightAction === action ? 'bg-ios-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
