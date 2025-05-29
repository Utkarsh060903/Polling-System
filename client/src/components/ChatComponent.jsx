import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, UserX, Users, X } from 'lucide-react';
import chatSVG from '../assets/chat.svg'; 

const ChatComponent = ({ 
  userRole, 
  studentName, 
  connectedStudents = [], 
  socketService,
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socketService) return;

    // Set up chat event listeners
    const setupChatListeners = () => {
      socketService.getSocket()?.on('chat_message', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: data.username,
          message: data.message,
          timestamp: new Date(data.timestamp),
          userRole: data.userRole
        }]);
      });

      socketService.getSocket()?.on('user_typing', (data) => {
        if (data.username !== (userRole === 'teacher' ? 'Teacher' : studentName)) {
          setIsTyping(data.username);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping('');
          }, 3000);
        }
      });

      socketService.getSocket()?.on('user_stopped_typing', () => {
        setIsTyping('');
        clearTimeout(typingTimeoutRef.current);
      });

      socketService.getSocket()?.on('student_kicked', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: 'System',
          message: `${data.studentName} has been removed from the session`,
          timestamp: new Date(),
          userRole: 'system'
        }]);
      });

      socketService.getSocket()?.on('user_joined_chat', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: 'System',
          message: `${data.username} joined the chat`,
          timestamp: new Date(),
          userRole: 'system'
        }]);
      });
    };

    setupChatListeners();

    // Announce user joining chat
    if (socketService.isConnected()) {
      socketService.getSocket()?.emit('join_chat', {
        username: userRole === 'teacher' ? 'Teacher' : studentName,
        userRole: userRole
      });
    }

    return () => {
      socketService.getSocket()?.off('chat_message');
      socketService.getSocket()?.off('user_typing');
      socketService.getSocket()?.off('user_stopped_typing');
      socketService.getSocket()?.off('student_kicked');
      socketService.getSocket()?.off('user_joined_chat');
    };
  }, [socketService, userRole, studentName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketService?.isConnected()) return;

    const messageData = {
      username: userRole === 'teacher' ? 'Teacher' : studentName,
      message: newMessage.trim(),
      timestamp: new Date(),
      userRole: userRole
    };

    socketService.getSocket()?.emit('send_chat_message', messageData);
    setNewMessage('');
    handleStopTyping();
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketService?.isConnected() && e.target.value.trim()) {
      socketService.getSocket()?.emit('typing', {
        username: userRole === 'teacher' ? 'Teacher' : studentName
      });
    }
  };

  const handleStopTyping = () => {
    if (socketService?.isConnected()) {
      socketService.getSocket()?.emit('stop_typing');
    }
  };

  const kickStudent = (studentToKick) => {
    if (userRole === 'teacher' && socketService?.isConnected()) {
      socketService.getSocket()?.emit('kick_student', { studentName: studentToKick });
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-10 right-16 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-[#5A66D1] text-white p-5 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          {/* <MessageCircle size={20} /> */}
          <img src={chatSVG} height={30} width={30} alt="" />
          {/* {messages.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {messages.length}
            </span>
          )} */}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-sm font-medium relative ${
            activeTab === 'chat' 
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
              : 'text-gray-600 hover:text-gray-800 bg-gray-50'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 px-4 py-3 text-sm font-medium relative ${
            activeTab === 'participants' 
              ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
              : 'text-gray-600 hover:text-gray-800 bg-gray-50'
          }`}
        >
          Participants
        </button>
      </div>

      {/* Chat Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  {msg.userRole === 'system' ? (
                    <div className="text-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-purple-600 font-medium mb-1">
                        {msg.username}
                      </div>
                      <div className={`inline-block max-w-xs rounded-2xl px-4 py-2 ${
                        msg.username === (userRole === 'teacher' ? 'Teacher' : studentName)
                          ? 'bg-purple-500 text-white ml-auto float-right'
                          : 'bg-gray-800 text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="clear-both"></div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div>
                <div className="text-xs text-purple-600 font-medium mb-1">
                  {isTyping}
                </div>
                <div className="inline-block bg-gray-200 text-gray-600 rounded-2xl px-4 py-2">
                  <span className="text-sm">typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onBlur={handleStopTyping}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !socketService?.isConnected()}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </>
      )}

      {/* Participants Tab Content */}
      {activeTab === 'participants' && (
        <div className="flex-1 bg-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Name</span>
              <span className="text-sm font-medium text-gray-600">Action</span>
            </div>
            
            <div className="space-y-3">
              {/* Show Teacher */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">
                  Teacher {userRole === 'teacher' && '(You)'}
                </span>
                <span className="text-sm text-gray-500">-</span>
              </div>
              
              {/* Show all students */}
              {connectedStudents.map((student, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">
                    {student} {userRole === 'student' && student === studentName && '(You)'}
                  </span>
                  {userRole === 'teacher' ? (
                    <button
                      onClick={() => kickStudent(student)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Kick out
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
              ))}
              
              {/* Show current student if not in connectedStudents list */}
              {userRole === 'student' && !connectedStudents.includes(studentName) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">{studentName} (You)</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onToggleMinimize}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ChatComponent;