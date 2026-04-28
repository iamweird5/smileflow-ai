import React, { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const send = async () => {
    const res = await fetch(process.env.REACT_APP_API_URL + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        clinicId: "YOUR_CLINIC_ID"
      })
    });

    const data = await res.json();

    setMessages([...messages, { user: input }, { ai: data.reply }]);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SmileFlow AI</h2>

      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.user ? "You" : "AI"}:</b> {m.user || m.ai}
        </div>
      ))}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type..."
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
