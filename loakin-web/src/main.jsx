import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            {/* NotificationProvider sits inside AuthProvider so it can read user + token */}
            <NotificationProvider>
                <ChatProvider>
                    <App />
                </ChatProvider>
            </NotificationProvider>
        </AuthProvider>
    </React.StrictMode>
);
