'use client';

import dynamic from 'next/dynamic';

const ChatFABComponent = dynamic(() => import('./ChatFAB'), {
  ssr: false,
});

export default function LazyChatFAB() {
  return <ChatFABComponent />;
}

