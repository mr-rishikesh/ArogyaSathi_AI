// App.jsx
import React, { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleSend = async () => {
    if (!prompt.trim() && !image) return;

    const userMessage = {
      type: "user",
      text: prompt + (image ? " [Image attached]" : ""),
    };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    const formData = new FormData();
    formData.append("message", prompt);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { type: "ai", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setImage(null);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🧠 Mental Health Assistant</h1>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.type === "user" ? "user" : "ai"}`}
          >
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-message ai">
            <span>Thinking...</span>
          </div>
        )}
      </div>
      <div className="input-box">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your concern or question..."
          rows={2}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
