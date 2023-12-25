"use client"

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar'
import MessageBar from '@/components/messagebar'
import { useSession } from 'next-auth/react';
import { AuthenticatedUser } from '@/utils/auth-utils';
import { isOk, unwrap } from '@/models/result';
import { fetchUserData } from '@/utils/user-client-utils'
import { LoadingScreen } from '@/components/loading'

export default function Home() {
  const [message, setMessage] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | undefined>(undefined);

  const { data: session } = useSession(); 

  useEffect(() => {
    const loadProfile = async () => {
      let userResult = undefined;  
      if (session && session.user && session.user.email) {
        userResult = await fetchUserData(session.user.email, setUser);
      }

      if (!userResult || !isOk(userResult)) {
        setProfileLoaded(false);
        // TODO: handle error
      }

      setProfileLoaded(true);
  };

    loadProfile();
  }, [session]);  


  if (!profileLoaded) {
    return <LoadingScreen />;
  }

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