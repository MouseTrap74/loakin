import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getEcho } from '../services/echo';
import api from '../services/api';

const FONT = 'Nunito, sans-serif';

/* ── Inline styles ─────────────────────────────────────────── */
const S = {
  bubble: {
    position:'fixed',bottom:24,right:24,width:56,height:56,borderRadius:'50%',
    background:'#3BBFC9',border:'none',cursor:'pointer',zIndex:9999,
    display:'flex',alignItems:'center',justifyContent:'center',
    boxShadow:'0 4px 16px rgba(59,191,201,0.45)',transition:'transform .15s',
  },
  dot: {
    position:'absolute',top:2,right:2,width:14,height:14,borderRadius:'50%',
    background:'#e53e3e',border:'2px solid #fff',
  },
  win: {
    position:'fixed',bottom:90,right:24,width:400,height:560,
    background:'#fff',borderRadius:16,boxShadow:'0 12px 40px rgba(0,0,0,.18)',
    zIndex:9998,display:'flex',flexDirection:'column',overflow:'hidden',
    border:'1px solid #e2e8f0',fontFamily:FONT,
  },
  hdr: {
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'14px 18px',borderBottom:'1px solid #e2e8f0',flexShrink:0,
  },
  hdrTitle:{fontWeight:800,fontSize:'1.05rem',color:'#333',fontFamily:FONT},
  closeBtn:{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem',color:'#8a9ab0',padding:4,fontFamily:FONT},
  body:{flex:1,overflowY:'auto',background:'#f8fafc'},
  emptyBox:{textAlign:'center',padding:'48px 24px',color:'#718096',fontFamily:FONT},
  convItem:{
    display:'flex',alignItems:'center',gap:12,padding:'13px 18px',
    cursor:'pointer',borderBottom:'1px solid #f0f4f8',background:'#fff',
    transition:'background .1s',
  },
  avatar:{
    width:44,height:44,borderRadius:'50%',background:'#e2e8f0',flexShrink:0,
    display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',
    overflow:'hidden',
  },
  convName:{fontWeight:700,fontSize:'.92rem',color:'#333',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:FONT},
  convPreview:{fontSize:'.82rem',color:'#718096',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:FONT},
  convTime:{fontSize:'.72rem',color:'#a0aec0',flexShrink:0,fontFamily:FONT},
  unreadBadge:{
    background:'#e53e3e',color:'#fff',borderRadius:'50%',minWidth:20,height:20,
    display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:'.7rem',fontWeight:700,flexShrink:0,marginLeft:4,fontFamily:FONT,
  },
  /* Chat view */
  chatHdr:{
    display:'flex',alignItems:'center',gap:10,padding:'12px 16px',
    borderBottom:'1px solid #e2e8f0',flexShrink:0,
  },
  backBtn:{background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'#3BBFC9',padding:4},
  chatName:{fontWeight:700,fontSize:'.95rem',color:'#333',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:FONT},
  msgArea:{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:8,background:'#f7fafc'},
  msgRow:(mine)=>({display:'flex',flexDirection:'column',alignItems:mine?'flex-end':'flex-start'}),
  msgBubble:(mine)=>({
    maxWidth:'82%',padding:'10px 14px',wordBreak:'break-word',fontSize:'.92rem',
    borderRadius:mine?'16px 16px 4px 16px':'16px 16px 16px 4px',
    background:mine?'#3BBFC9':'#fff',color:mine?'#fff':'#2d3748',
    boxShadow:'0 1px 3px rgba(0,0,0,.07)',whiteSpace:'pre-wrap',fontFamily:FONT,
    lineHeight:1.45,
  }),
  msgTime:{fontSize:'.68rem',color:'#a0aec0',marginTop:3,fontFamily:FONT},
  inputBar:{
    display:'flex',alignItems:'flex-end',gap:8,padding:'10px 12px',
    borderTop:'1px solid #e2e8f0',flexShrink:0,background:'#fff',
  },
  textarea:{
    flex:1,resize:'none',border:'1px solid #e2e8f0',borderRadius:20,
    padding:'9px 14px',fontSize:'.9rem',outline:'none',fontFamily:FONT,
    maxHeight:84,overflowY:'auto',lineHeight:1.45,
  },
  sendBtn:(ok)=>({
    background:ok?'#3BBFC9':'#cbd5e0',color:'#fff',border:'none',borderRadius:'50%',
    width:36,height:36,cursor:ok?'pointer':'default',fontSize:'.95rem',flexShrink:0,
    display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s',
    fontFamily:FONT,
  }),
};

/* ── Helper ─────────────────────────────────────────────────── */
function formatTime(iso){
  if(!iso)return '';
  const d=new Date(iso),now=new Date(),diff=now-d;
  if(diff<60000)return 'Baru saja';
  if(diff<3600000)return `${Math.floor(diff/60000)} mnt`;
  if(diff<86400000)return d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString('id-ID',{day:'numeric',month:'short'});
}

/* ================================================================
   CHAT WIDGET COMPONENT
   ================================================================ */
export default function ChatWidget(){
  const {user,token,isLoggedIn}=useAuth();
  const {totalUnread,conversations,loading,widgetOpen,toggleWidget,closeWidget,fetchConversations}=useChat();

  const [activeConv,setActiveConv]=useState(null);
  const [messages,setMessages]=useState([]);
  const [msgLoading,setMsgLoading]=useState(false);
  const [body,setBody]=useState('');
  const [sending,setSending]=useState(false);
  const bottomRef=useRef(null);
  const textareaRef=useRef(null);
  const pollRef=useRef(null);

  /* ── Load conversation messages ─────────────────────────── */
  const openConversation=useCallback(async(conv)=>{
    setActiveConv(conv);
    setMsgLoading(true);
    try{
      const res=await api.get(`/conversations/${conv.id}`);
      const data=res.data.data;
      setMessages(data.messages??[]);
      // Mark as read
      api.patch(`/conversations/${conv.id}/read`).catch(()=>{});
      fetchConversations();
    }catch{setMessages([]);}
    setMsgLoading(false);
  },[fetchConversations]);

  /* ── Real-time messages for active conversation (Echo) ─── */
  useEffect(()=>{
    if(!activeConv||!token)return;
    let echo;
    try{
      echo=getEcho(token);
      const ch=echo.private(`conversation.${activeConv.id}`);
      ch.listen('.message.sent',(data)=>{
        setMessages(prev=>{
          if(prev.some(m=>m.id===data.id))return prev;
          return[...prev,data];
        });
        if(document.visibilityState==='visible'){
          api.patch(`/conversations/${activeConv.id}/read`).catch(()=>{});
          fetchConversations();
        }
      });
    }catch(e){console.warn('[ChatWidget] echo err',e);}
    return()=>{try{if(echo)echo.leave(`conversation.${activeConv.id}`);}catch(_){}};
  },[activeConv?.id,token]);

  /* ── Polling fallback for real-time (every 5s when conv is open) ── */
  useEffect(()=>{
    if(!activeConv)return;
    pollRef.current=setInterval(async()=>{
      try{
        const res=await api.get(`/conversations/${activeConv.id}`);
        const freshMsgs=res.data.data.messages??[];
        setMessages(prev=>{
          if(freshMsgs.length!==prev.length)return freshMsgs;
          const lastFresh=freshMsgs[freshMsgs.length-1];
          const lastPrev=prev[prev.length-1];
          if(lastFresh?.id!==lastPrev?.id)return freshMsgs;
          return prev;
        });
      }catch{}
    },5000);
    return()=>clearInterval(pollRef.current);
  },[activeConv?.id]);

  /* ── Scroll to bottom ──────────────────────────────────── */
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  /* ── Send message ──────────────────────────────────────── */
  const send=useCallback(async()=>{
    if(sending||!body.trim()||!activeConv)return;
    setSending(true);
    try{
      const form=new FormData();
      form.append('body',body.trim());
      const res=await api.post(`/conversations/${activeConv.id}/messages`,form,{
        headers:{'Content-Type':'multipart/form-data'},
      });
      setMessages(prev=>{
        if(prev.some(m=>m.id===res.data.data.id))return prev;
        return[...prev,res.data.data];
      });
      setBody('');
      textareaRef.current?.focus();
      fetchConversations();
    }catch{alert('Gagal mengirim pesan.');}
    setSending(false);
  },[activeConv,body,sending,fetchConversations]);

  const handleKeyDown=(e)=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
  };

  const handleBack=()=>{setActiveConv(null);setMessages([]);fetchConversations();};

  /* ── When widget closes, reset to inbox ────────────────── */
  useEffect(()=>{if(!widgetOpen){setActiveConv(null);setMessages([]);}},[widgetOpen]);

  /* ── Determine other user in active conversation ──────── */
  const otherUser=activeConv?.other_user
    ?? (activeConv?.participant_one?.id===user?.id ? activeConv?.participant_two : activeConv?.participant_one);

  // Don't render if not logged in
  if(!isLoggedIn()) return null;

  return(
    <>
      {/* ── Floating Bubble ── */}
      <button
        style={S.bubble}
        onClick={toggleWidget}
        aria-label="Chat"
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {totalUnread>0&&<span style={S.dot}/>}
      </button>

      {/* ── Chat Window ── */}
      {widgetOpen&&(
        <div style={S.win}>
          {!activeConv?(
            /* ── INBOX VIEW ── */
            <>
              <div style={S.hdr}>
                <span style={S.hdrTitle}>Pesan</span>
                <button style={S.closeBtn} onClick={closeWidget}>✕</button>
              </div>
              <div style={S.body}>
                {loading?(
                  <div style={S.emptyBox}>Memuat percakapan...</div>
                ):conversations.length===0?(
                  <div style={S.emptyBox}>
                    <div style={{fontSize:'2.4rem',marginBottom:8}}>💬</div>
                    <p style={{margin:0,fontWeight:600,fontSize:'.92rem'}}>Belum ada percakapan.</p>
                    <p style={{margin:'4px 0 0',fontSize:'.82rem'}}>Mulai chat dari halaman detail listing.</p>
                  </div>
                ):(
                  conversations.map(conv=>(
                    <div
                      key={conv.id}
                      style={S.convItem}
                      onClick={()=>openConversation(conv)}
                      onMouseEnter={e=>e.currentTarget.style.background='#f7fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                    >
                      <div style={S.avatar}>
                        {conv.other_user?.photo_url
                          ?<img src={conv.other_user.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          :'👤'}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                          <span style={S.convName}>{conv.other_user?.name??'Pengguna'}</span>
                          <span style={S.convTime}>{formatTime(conv.last_message_at)}</span>
                        </div>
                        {conv.listing&&(
                          <div style={{fontSize:'.72rem',color:'#3BBFC9',fontWeight:700,fontFamily:FONT}}>🏷️ {conv.listing.title}</div>
                        )}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={S.convPreview}>
                            {conv.latest_message?.photo_path&&!conv.latest_message?.body
                              ?'📷 Foto'
                              :(conv.latest_message?.body??'Belum ada pesan')}
                          </span>
                          {conv.unread_count>0&&<span style={S.unreadBadge}>{conv.unread_count}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ):(
            /* ── CHAT VIEW ── */
            <>
              <div style={S.chatHdr}>
                <button style={S.backBtn} onClick={handleBack}>←</button>
                <div style={S.avatar}>
                  {otherUser?.photo_url
                    ?<img src={otherUser.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    :'👤'}
                </div>
                <span style={S.chatName}>{otherUser?.name??'Pengguna'}</span>
                <button style={S.closeBtn} onClick={closeWidget}>✕</button>
              </div>
              <div style={S.msgArea}>
                {msgLoading?(
                  <div style={{textAlign:'center',color:'#a0aec0',marginTop:40,fontFamily:FONT}}>Memuat...</div>
                ):messages.length===0?(
                  <div style={{textAlign:'center',color:'#a0aec0',marginTop:40,fontSize:'.9rem',fontFamily:FONT}}>
                    Belum ada pesan. Mulai percakapan! 👋
                  </div>
                ):(
                  messages.map(msg=>{
                    const mine=msg.sender_id===user?.id;
                    return(
                      <div key={msg.id} style={S.msgRow(mine)}>
                        <div style={S.msgBubble(mine)}>
                          {msg.photo_url&&(
                            <img src={msg.photo_url} alt="foto" style={{maxWidth:'100%',borderRadius:8,marginBottom:msg.body?6:0,display:'block',cursor:'pointer'}} onClick={()=>window.open(msg.photo_url,'_blank')}/>
                          )}
                          {msg.body&&<span>{msg.body}</span>}
                        </div>
                        <span style={S.msgTime}>
                          {new Date(msg.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                          {mine&&<span style={{marginLeft:3,color:msg.is_read?'#3BBFC9':'#a0aec0'}}>{msg.is_read?'✓✓':'✓'}</span>}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef}/>
              </div>
              <div style={S.inputBar}>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={e=>setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan..."
                  rows={1}
                  style={S.textarea}
                />
                <button
                  onClick={send}
                  disabled={sending||!body.trim()}
                  style={S.sendBtn(!sending&&body.trim())}
                >
                  {sending?'⏳':'➤'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
