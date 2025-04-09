import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const NovaChat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("novaHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent submission if input is empty

    const newMessage = { role: "user", text: input };
    
    setHistory((prev) => {
      const updated = [...prev, newMessage];
      localStorage.setItem("novaHistory", JSON.stringify(updated));
      return updated;
    });
    setLoading(true);

    try {
      const res = await fetch("https://t3snaxxmq6.execute-api.us-east-1.amazonaws.com/dev/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      const botMessage = { role: "nova", text: data.output };
      setHistory((prev) => {
        const updated = [...prev, botMessage];
        localStorage.setItem("novaHistory", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }

    setInput("");
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
    };
  };

  return (
    <div className={`animated-background flex items-center justify-center min-h-screen ${darkMode ? "text-white" : "text-black"}`}>
      <div className="absolute top-4 right-4">
        {/* <Button
          color="black"
          onClick={() => setDarkMode(!darkMode)}
          ripple="light"
          className={`${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
        </Button> */}
      </div>
      <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-5xl font-bold mb-4 text-center">🧠 Nova Sonic Chat</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 h-96 overflow-y-auto mb-4">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 p-2 rounded-lg w-fit max-w-[75%] ${
                msg.role === "user" ? "bg-blue-100 self-end ml-auto" : "bg-gray-100"
              } ${darkMode ? "bg-red-500 text-white" : "bg-gray-100 text-black"}`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className="italic text-gray-500">Thinking...</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-2 rounded-lg"
            placeholder="Type or speak..."
          />
          <button
            type="button"
            onClick={startListening}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg"
          >
            🎤
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default NovaChat;