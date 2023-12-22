"use client"

import React, { useState } from 'react';
import Navbar from '@/components/navbar'
import MessageBar from '@/components/messagebar'

export default function Home() {
  const [message, setMessage] = useState('');

  return (
    <main className='flex flex-col h-screen bg-[#121212] text-white'> 
      <div className='sticky top-0'> 
        <Navbar/>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Messages will go here */}
      </div>
      <MessageBar onMessageSend={message => setMessage(message)} className="sticky bottom-0 py-[2%] px-[10%]"/> 
    </main>
  );
}