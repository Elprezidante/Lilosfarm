import React, { useState, useRef, useEffect } from "react";

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────
const KB = [
  {
    keywords: ["hello", "hi", "hey", "greet", "greetings"],
    response: "Hello! Welcome to Lilo's Farm 🌿 How can we help you today?",
  },
  {
    keywords: ["vegetable", "vegetables", "greens", "sukuma", "spinach", "cabbage", "kale"],
    response: "Yes! We have fresh vegetables harvested daily including sukuma wiki, spinach, and cabbage. 🥬 Type 'order' to buy!",
  },
  {
    keywords: ["fruit", "fruits", "mango", "mangoes", "banana", "bananas", "orange", "avocado"],
    response: "Yes, we stock fresh fruits like bananas, mangoes, oranges, and avocados. 🍊🥭 All freshly picked!",
  },
  {
    keywords: ["price", "cost", "amount", "how much", "pricing"],
    response: "Our prices depend on quantity and season. Please tell us the specific item you need for exact pricing. 💰",
  },
  {
    keywords: ["delivery", "deliver", "transport", "ship", "shipping", "bring"],
    response: "Yes 🚚 We offer delivery services depending on your location. Contact us for delivery fees and timelines!",
  },
  {
    keywords: ["egg", "eggs", "chicken", "poultry", "hen"],
    response: "Yes, we provide fresh farm eggs and poultry products. 🥚🐔 All free-range and farm-fresh!",
  },
  {
    keywords: ["seed", "seeds", "planting", "plant", "crop", "crops"],
    response: "Yes 🌱 We sell quality seeds for vegetables and other crops. Ask us about what's in season!",
  },
  {
    keywords: ["fertilizer", "manure", "compost", "organic"],
    response: "Yes, we have organic manure and fertilizer to boost your farm production. 🌾 100% natural!",
  },
  {
    keywords: ["order", "buy", "purchase", "want", "need"],
    response: "Great! 🛒 Please tell us the items and quantities you need, and we'll assist you. You can also browse our products above!",
  },
  {
    keywords: ["location", "where", "place", "address", "directions", "find"],
    response: "Lilo's Farm is available locally. 📍 Please contact us directly for directions and pickup details!",
  },
  {
    keywords: ["hours", "hour", "open", "close", "time", "schedule"],
    response: "We are open daily during business hours (Mon–Sat, 7am–6pm). ⏰ Contact us for today's schedule!",
  },
  {
    keywords: ["thanks", "thank you", "thank"],
    response: "You're welcome 🌻 Thank you for choosing Lilo's Farm! Is there anything else we can help with?",
  },
  {
    keywords: ["bye", "goodbye", "see you", "later", "farewell"],
    response: "Goodbye 👋 We look forward to serving you again at Lilo's Farm. Have a wonderful day!",
  },
  {
    keywords: ["about", "lilos farm", "lilo", "what is", "tell me"],
    response: "Lilo's Farm is a trusted local farm delivering fresh, quality produce to your door. 🌿 We grow vegetables, fruits, eggs, and more — all with love and care!",
  },
  {
    keywords: ["tomato", "tomatoes"],
    response: "Yes! We have fresh tomatoes available. 🍅 Prices vary by season — ask us for today's rate!",
  },
  {
    keywords: ["dairy", "milk", "yogurt", "cheese"],
    response: "Yes, we carry dairy products including fresh farm milk! 🥛 All sourced from our own livestock.",
  },
];

const SUGGESTIONS = [
  "Do you sell eggs?",
  "What vegetables do you have?",
  "Do you deliver?",
  "What are your prices?",
  "Tell me about Lilo's Farm",
];

const getResponse = (input) => {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return "I'm not sure about that yet 🌾 Please contact us directly or browse our products above for more info!";
};

// ─── CHATBOT COMPONENT ────────────────────────────────────────────────────
const FarmChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! 🌿 Welcome to Lilo's Farm. Ask me anything about our products, delivery, or pricing!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { from: "user", text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const botReply = { from: "bot", text: getResponse(msg), time: new Date() };
      setMessages((prev) => [...prev, botReply]);
      setTyping(false);
      if (!open) setUnread((u) => u + 1);
    }, 900 + Math.random() * 400);
  };

  const fmt = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        .lf-chat-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2d5a1b, #4a8f2e);
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 28px rgba(45,90,27,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lf-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 36px rgba(45,90,27,0.55);
        }
        .lf-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #e74c3c;
          color: white;
          font-size: 11px;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          border: 2px solid white;
        }
        .lf-window {
          position: fixed;
          bottom: 104px;
          right: 28px;
          width: 360px;
          max-height: 540px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(45,90,27,0.15);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          background: #ffffff;
          animation: lf-slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        @keyframes lf-slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lf-header {
          background: linear-gradient(135deg, #2d5a1b 0%, #4a8f2e 100%);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lf-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .lf-header-info { flex: 1; }
        .lf-header-name { color: white; font-weight: 600; font-size: 15px; }
        .lf-header-status {
          color: rgba(255,255,255,0.75);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .lf-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #a8d87a;
          box-shadow: 0 0 0 2px rgba(168,216,122,0.4);
          display: inline-block;
        }
        .lf-close {
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 8px;
          color: white;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background 0.15s;
        }
        .lf-close:hover { background: rgba(255,255,255,0.25); }
        .lf-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 6px;
          background: #f7faf3;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 0;
          max-height: 360px;
        }
        .lf-messages::-webkit-scrollbar { width: 4px; }
        .lf-messages::-webkit-scrollbar-thumb { background: #c8e8a0; border-radius: 4px; }
        .lf-bubble-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .lf-bubble-row.user { flex-direction: row-reverse; }
        .lf-bubble-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e8f5d8, #c8e8a0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .lf-bubble {
          max-width: 76%;
          padding: 10px 13px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          position: relative;
        }
        .lf-bubble.bot {
          background: #ffffff;
          color: #2d3a1e;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 2px 8px rgba(45,90,27,0.08);
          border: 1px solid #e8f0dc;
        }
        .lf-bubble.user {
          background: linear-gradient(135deg, #3d7a25, #4a8f2e);
          color: white;
          border-radius: 16px 16px 4px 16px;
        }
        .lf-time {
          font-size: 10px;
          color: #aab89a;
          margin-top: 4px;
          text-align: right;
          font-family: sans-serif;
        }
        .lf-time.bot { text-align: left; }
        .lf-typing {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }
        .lf-typing-dots {
          background: white;
          border: 1px solid #e8f0dc;
          border-radius: 16px 16px 16px 4px;
          padding: 10px 14px;
          display: flex;
          gap: 4px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(45,90,27,0.08);
        }
        .lf-typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #7a9a5a;
          animation: lf-bounce 1.2s infinite;
        }
        .lf-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .lf-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes lf-bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .lf-suggestions {
          padding: 8px 14px;
          display: flex;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          border-top: 1px solid #eef4e4;
          background: #f7faf3;
        }
        .lf-suggestions::-webkit-scrollbar { display: none; }
        .lf-chip {
          background: white;
          border: 1px solid #c8e8a0;
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 12px;
          color: #3d7a25;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
          font-family: sans-serif;
        }
        .lf-chip:hover { background: #eaf5d4; border-color: #5aaa38; }
        .lf-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid #eef4e4;
          background: white;
        }
        .lf-input {
          flex: 1;
          border: 1.5px solid #e0e8d0;
          border-radius: 24px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-family: sans-serif;
          color: #2d3a1e;
          outline: none;
          background: #fafcf7;
          transition: border-color 0.2s;
        }
        .lf-input:focus { border-color: #4a8f2e; background: #f5fdf0; }
        .lf-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3d7a25, #5aaa38);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 3px 10px rgba(45,90,27,0.3);
        }
        .lf-send:hover { transform: scale(1.08); box-shadow: 0 5px 14px rgba(45,90,27,0.4); }
        .lf-send:active { transform: scale(0.95); }
        @media (max-width: 400px) {
          .lf-window { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
        }
      `}</style>

      {/* FAB Button */}
      <button className="lf-chat-fab" onClick={() => setOpen((o) => !o)} title="Chat with us">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" opacity="0.9"/>
            <circle cx="8.5" cy="10.5" r="1.2" fill="#2d5a1b"/>
            <circle cx="12" cy="10.5" r="1.2" fill="#2d5a1b"/>
            <circle cx="15.5" cy="10.5" r="1.2" fill="#2d5a1b"/>
          </svg>
        )}
        {!open && unread > 0 && <div className="lf-badge">{unread}</div>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="lf-window">

          {/* Header */}
          <div className="lf-header">
            <div className="lf-avatar">🌿</div>
            <div className="lf-header-info">
              <div className="lf-header-name">Lilo's Farm Assistant</div>
              <div className="lf-header-status">
                <span className="lf-dot"/> Online — here to help
              </div>
            </div>
            <button className="lf-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="lf-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`lf-bubble-row ${msg.from}`}>
                {msg.from === "bot" && (
                  <div className="lf-bubble-avatar">🌱</div>
                )}
                <div>
                  <div className={`lf-bubble ${msg.from}`}>{msg.text}</div>
                  <div className={`lf-time ${msg.from}`}>{fmt(msg.time)}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="lf-bubble-row bot lf-typing">
                <div className="lf-bubble-avatar">🌱</div>
                <div className="lf-typing-dots">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick suggestion chips */}
          <div className="lf-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="lf-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div className="lf-input-row">
            <input
              ref={inputRef}
              className="lf-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="lf-send" onClick={() => send()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FarmChatbot;