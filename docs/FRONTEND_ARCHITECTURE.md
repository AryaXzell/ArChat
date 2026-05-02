# Frontend Architecture - v1 Chat Application

## 1. Stack & Tools
- **Framework:** React 18+ with Vite (mirrors App Router concepts using React Router)
- **Styling:** Tailwind CSS + custom glassmorphism utilities
- **State Management:** React Context + Hooks for local UI state; Socket.io-client for real-time state.
- **Animations:** Motion (Framer Motion) for gesture and transition system
- **Icons:** Lucide React

## 2. Component Breakdown

### App Structure
- `App.tsx`: Main entry, ThemeProvider, AuthProvider, SocketProvider.
- `Layout.tsx`: Responsive navigation (bottom bar on mobile, sidebar on desktop).

### Chat List (`/components/chat-list`)
- `ChatList.tsx`: Virtualized or optimized list.
- `ChatItem.tsx`: Individual chat row with swipe gestures.
- `SearchHeader.tsx`: Sticky search bar.
- `QuickPreviewModal.tsx`: Long-press floating preview.

### Chat Room (`/components/chat-room`)
- `ChatRoom.tsx`: Main view.
- `MessageList.tsx`: Auto-scrolling list, grouped by sender/time.
- `MessageBubble.tsx`: Individual message (soft glass or solid).
- `MessageInput.tsx`: Text area, media attachment buttons.
- `TypingIndicator.tsx`: Animated dots.

### UI primitives (`/components/ui`)
- Buttons, Dialogs, Inputs, Avatars, Swipeable containers.

## 3. Realtime Message Flow Design
1. **Send:** User types -> `sendMessage` called -> Optimistic UI update (status: 'sending') -> Socket emission.
2. **Ack:** Server receives -> DB write -> Server acks to sender -> Status changes to 'sent'.
3. **Receive:** Socket event `message:new` -> Unshift to `MessageList` -> If active room, emit `message:read` -> Sender receives `message:delivered`/`read`.

## 4. UI/UX Screen Design
- **Glass System:** Integrated deep cleanly via Tailwind classes like `bg-white/10 backdrop-blur-md border border-white/5`.
- **Accessibility:** 
  - Dynamic text scale via Context.
  - Reduced motion via `window.matchMedia("(prefers-reduced-motion: reduce)")`.
  - Accessible `aria-labels` on all buttons.

## 5. Gesture System Strategy
- Use `motion`'s `useDrag` for swipeable list items and back navigation.
- Track distance; if `x < -100`, trigger 'archive' action.
- Long-press detected via `onPointerDown` with a `setTimeout` (cleared on `onPointerUp`/`onPointerMove`).
