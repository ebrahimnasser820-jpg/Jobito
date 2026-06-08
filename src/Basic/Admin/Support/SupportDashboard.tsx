import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";
import { useJobitoAuth } from '../../../context/LinkContxt';
import { API_BASE_URL } from '../../../services/api';
import { useTranslation } from '../../../context/translation-context';
import { useTheme } from '../../../context/ThemeContext';
import styles from './SupportDashboard.module.css';

interface SupportDashboardProps {
  preselectedUser?: any;
}

const SupportDashboard: React.FC<SupportDashboardProps> = ({ preselectedUser }) => {
  const { apiFetch, user: authUser } = useJobitoAuth();
  const { t, language } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [sidebarTab, setSidebarTab] = useState<'users' | 'admins'>('users');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(preselectedUser || null);
  const [reply, setReply] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const selectedIdRef = useRef<any>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages, isOtherTyping]);

  const fetchTickets = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/support/tickets`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/staff`);
      if (res.ok) {
        const data = await res.json();
        setAdmins(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentChats = async () => {
    if (!authUser?.id) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/chat/my-chats/${authUser?.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecentChats(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRecentChats();
  }, [apiFetch, language, authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) return;
    
    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_user", { userId: authUser.id });
    });

    socket.on("new_p2p_message", (msg: any) => {
      fetchRecentChats();
      
      const currentSelectedId = selectedIdRef.current;
      const isRelevant = currentSelectedId && 
        (msg.senderId === currentSelectedId || msg.recipientId === currentSelectedId);

      if (isRelevant) {
        setIsOtherTyping(false);
        setSelectedTicket((prev: any) => {
          if (!prev) return prev;
          const messages = prev.messages || [];

          // 1. Already exists by real ID - skip
          if (msg.id && messages.find((m: any) => m.id === msg.id)) return prev;

          // 2. Replace temp message with real one (sent by me)
          if (msg.senderId === authUser?.id) {
            const tempMatch = messages.find((m: any) => 
              m.id?.startsWith('temp_') && 
              m.message?.trim() === msg.message?.trim()
            );
            if (tempMatch) {
              return { ...prev, messages: messages.map((m: any) => m.id === tempMatch.id ? msg : m) };
            }
          }

          // 3. Append new message
          return { ...prev, messages: [...messages, msg] };
        });
      }
    });

    socket.on("user_typing", (payload: { senderId: string; isTyping: boolean }) => {
      const currentSelectedId = selectedIdRef.current;
      if (currentSelectedId && payload.senderId === currentSelectedId) {
        setIsOtherTyping(payload.isTyping);
        if (payload.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [authUser?.id]);

  const markChatAsRead = async (otherId: string) => {
    if (!authUser?.id) return;
    try {
      await apiFetch(`${API_BASE_URL}/chat/p2p/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser.id, otherId })
      });
      fetchRecentChats(); // Refresh unread counts in sidebar
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async (otherId: string) => {
    setSelectedId(otherId as any);
    try {
      const res = await apiFetch(`${API_BASE_URL}/chat/p2p/history?userId=${authUser?.id}&otherId=${otherId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket({
          ticket: { userName: selectedAdmin?.fullName, userEmail: selectedAdmin?.email },
          messages: data || []
        });
        markChatAsRead(otherId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserChatHistory = async (otherId: string, userObj: any) => {
    setSelectedId(otherId as any);
    try {
      const res = await apiFetch(`${API_BASE_URL}/chat/p2p/history?userId=${authUser?.id}&otherId=${otherId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket({
          ticket: { userName: userObj?.name, userEmail: userObj?.contactInfo },
          messages: data || [],
          isUserChat: true
        });
        markChatAsRead(otherId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (preselectedUser) {
      setSelectedUser(preselectedUser);
      fetchUserChatHistory(preselectedUser.userId, preselectedUser);
    }
  }, [preselectedUser]);

  useEffect(() => {
    if (selectedAdmin && !selectedUser) {
      fetchChatHistory(selectedAdmin.adminId);
    }
  }, [selectedAdmin, selectedUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReply(e.target.value);
    const isUserChat = selectedTicket?.isUserChat;
    const recipient = isUserChat ? selectedUser : selectedAdmin;
    const recipientId = isUserChat ? recipient?.userId : recipient?.adminId;
    if (socketRef.current && recipientId && authUser?.id) {
      socketRef.current.emit("typing", {
        senderId: authUser.id,
        recipientId: recipientId,
        isTyping: true,
      });
      if (emitTypingTimeoutRef.current) clearTimeout(emitTypingTimeoutRef.current);
      emitTypingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && recipientId) {
          socketRef.current.emit("typing", {
            senderId: authUser?.id,
            recipientId: recipientId,
            isTyping: false,
          });
        }
      }, 2000);
    }
  };

  const handleSendReply = async () => {
    const isUserChat = selectedTicket?.isUserChat;
    const recipient = isUserChat ? selectedUser : selectedAdmin;
    if (!reply.trim() || !recipient) return;

    const content = reply.trim();
    setReply("");

    // Stop typing indicator
    const recipientId = isUserChat ? recipient.userId : recipient.adminId;
    if (socketRef.current && recipientId && authUser?.id) {
      socketRef.current.emit("typing", {
        senderId: authUser.id,
        recipientId: recipientId,
        isTyping: false,
      });
    }

    // Optimistic update - add message to UI immediately
    const tempMessage = {
      id: `temp_${Date.now()}`,
      senderId: authUser?.id,
      recipientId: recipientId,
      message: content,
      createdAt: new Date().toISOString(),
    };
    setSelectedTicket((prev: any) => {
      if (!prev) return prev;
      return { ...prev, messages: [...prev.messages, tempMessage] };
    });
    
    try {
      await apiFetch(`${API_BASE_URL}/chat/p2p`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderId: authUser?.id,
          recipientId: recipientId,
          content: content 
        })
      });
      // WebSocket will handle the real message update
      fetchRecentChats();
    } catch (err) {
      console.error(err);
      // Remove optimistic message on error
      setSelectedTicket((prev: any) => {
        if (!prev) return prev;
        return { ...prev, messages: prev.messages.filter((m: any) => m.id !== tempMessage.id) };
      });
    }
  };

  const handleBackToList = () => {
    setSelectedAdmin(null);
    setSelectedUser(null);
    setSelectedTicket(null);
  };

  const handleCloseTicket = async () => {
    if (!selectedId) return;
    if (!window.confirm(t("Are you sure you want to close this ticket?"))) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/ops/support/tickets/${selectedId}/close`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchTicketMessages(selectedId);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.root} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.tabsRow}>
          {/* Tabs removed to use global Admin navigation */}
        </div>

      </nav>

      {/* Body */}
      <div className={`${styles.body} ${selectedTicket ? styles.hasActiveChat : ''}`}>
        {/* Sidebar */}
        <div className={styles.leftPanel}>
          <div style={{ display: 'flex', padding: '10px', gap: '10px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            <button 
              onClick={() => setSidebarTab('users')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: sidebarTab === 'users' ? 'var(--color-primary)' : 'transparent', color: sidebarTab === 'users' ? '#fff' : 'var(--color-text-muted)' }}
            >
              {t("Users")}
            </button>
            <button 
              onClick={() => setSidebarTab('admins')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: sidebarTab === 'admins' ? 'var(--color-primary)' : 'transparent', color: sidebarTab === 'admins' ? '#fff' : 'var(--color-text-muted)' }}
            >
              {t("Staff")}
            </button>
          </div>

          <div className={styles.ticketList} style={{ flex: 1, overflowY: 'auto' }}>
            {sidebarTab === 'admins' && admins.filter(a => a.adminId !== authUser?.id).map((adm) => (
              <div 
                key={adm.adminId} 
                className={`${styles.ticketItem} ${selectedAdmin?.adminId === adm.adminId ? styles.activeTicket : ''}`}
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedAdmin(adm);
                  // fetchChatHistory will be triggered by useEffect
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={styles.adminAvatarSmall}>{adm.fullName?.[0]}</div>
                  <div>
                    <div className={styles.ticketTitle}>{adm.fullName}</div>
                    <div className={styles.adminRoleLabel}>{t(adm.role)}</div>
                  </div>
                </div>
              </div>
            ))}

            {sidebarTab === 'users' && recentChats.map((chat) => (
              <div 
                key={chat.oderId} 
                className={`${styles.ticketItem} ${selectedUser?.userId === chat.oderId ? styles.activeTicket : ''}`}
                onClick={() => {
                  setSelectedAdmin(null);
                  setSelectedUser({ userId: chat.oderId, name: chat.name, contactInfo: chat.email });
                  fetchUserChatHistory(chat.oderId, { name: chat.name, contactInfo: chat.email });
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={styles.adminAvatarSmall}>{chat.name?.[0] || 'U'}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className={styles.ticketTitle} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.name}</div>
                    <div className={styles.adminRoleLabel} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.lastMessage || chat.email}</div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div style={{ background: 'var(--color-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className={styles.rightPanel}>
          {!selectedTicket ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: 48 }}>💬</div>
              <div className={styles.chatTitle}>{t("Select A Conversation To View Details")}</div>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <button className={styles.backBtn} onClick={handleBackToList} title={t("Back")}>
                  {language === 'ar' ? '→' : '←'}
                </button>
                <div className={styles.chatAvatar}>{selectedTicket.ticket.userName?.split(" ")?.map((n: string) => n[0])?.join("") || 'U'}</div>
                <div style={{ flex: 1 }}>
                  <div className={styles.chatTitle}>{selectedTicket.ticket.userName}</div>
                  <div className={styles.chatSub}>{selectedTicket.ticket.userEmail}</div>
                </div>
                
                {/* Average Response Time Display */}
                {(() => {
                  const msgs = selectedTicket.messages || [];
                  let totalMs = 0;
                  let count = 0;
                  let lastUserTime: number | null = null;
                  
                  const sorted = [...msgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  for (const m of sorted) {
                    const isMe = m.senderId === authUser?.id;
                    if (!isMe) {
                      if (lastUserTime === null) lastUserTime = new Date(m.createdAt).getTime();
                    } else if (isMe && lastUserTime !== null) {
                      totalMs += (new Date(m.createdAt).getTime() - lastUserTime);
                      count++;
                      lastUserTime = null;
                    }
                  }
                  
                  if (count > 0) {
                    const avgMins = Math.round((totalMs / count) / 60000);
                    const avgText = avgMins < 1 ? t("Under 1 min") : `${avgMins} ${t("mins")}`;
                    return (
                      <div style={{ textAlign: language === 'ar' ? 'left' : 'right', fontSize: '12px', color: 'var(--color-text-muted)', background: 'var(--color-bg-tertiary)', padding: '4px 8px', borderRadius: '12px' }}>
                        <strong style={{ display: 'block', color: 'var(--color-primary)' }}>{t("Avg Response Time")}</strong>
                        {avgText}
                      </div>
                    );
                  }
                  return null;
                })()}

              </div>
              <div className={styles.messages}>
                {selectedTicket.messages?.map((m: any, i: number) => {
                  const isMe = m.senderId === authUser?.id;
                  return (
                    <div key={i} className={`${styles.messageRow} ${!isMe ? styles.messageLeft : styles.messageRight}`}>
                      <div className={`${styles.bubble} ${!isMe ? styles.bubbleLeft : styles.bubbleRight}`}>
                        {m.message}
                      </div>
                      <div className={styles.msgTime} style={{ textAlign: !isMe ? "left" : "right" }}>
                        {new Date(m.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-GB')}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isOtherTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                    <div className={styles.adminAvatarSmall} style={{ width: 28, height: 28, fontSize: 12 }}>
                      {selectedTicket.ticket.userName?.[0] || 'U'}
                    </div>
                    <div className={styles.typingBubble}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>


              <div className={styles.inputArea}>
                <div className={styles.inputWrap}>
                  <input className={styles.inputEl} placeholder={t("Reply message")} value={reply} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} />
                </div>
                <button className={styles.sendBtn} onClick={handleSendReply}>➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
