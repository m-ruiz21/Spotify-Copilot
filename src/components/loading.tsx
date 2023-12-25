import React from 'react';
import '@/styles/loading.css'; 

export const LoadingScreen = () => {
    return (
        <div className="flex justify-center items-center h-screen text-2xl">
            <p>Loading user profile
                <span className="bounce dot1">.</span>
                <span className="bounce dot2">.</span>
                <span className="bounce">.</span>
            </p>
        </div>
    );
}

export default LoadingScreen;