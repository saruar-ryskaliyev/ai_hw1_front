'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import axios from 'axios';
import React from 'react';

interface Message {
  sender: 'user' | 'gemini';
  text: string;
}

interface ParsedMessage {
  type: 'header' | 'subheader' | 'bullet' | 'text';
  content: string;
}

const parseMessage = (message: string): ParsedMessage[] => {
  const lines = message.split('\n');
  return lines.map((line) => {
    if (line.startsWith('##')) {
      return { type: 'header', content: line.replace('##', '').trim() };
    } else if (line.startsWith('* **')) {
      return { type: 'subheader', content: line.replace('* **', '').replace('**', '').trim() };
    } else if (line.startsWith('*')) {
      return { type: 'bullet', content: line.replace('*', '').trim() };
    } else {
      return { type: 'text', content: line.trim() };
    }
  });
};

const RenderMessage: React.FC<{ message: string }> = ({ message }) => {
  const parsedMessages = parseMessage(message);
  return (
    <div>
      {parsedMessages.map((msg, index) => {
        switch (msg.type) {
          case 'header':
            return <h2 key={index} className="text-2xl font-bold my-4">{msg.content}</h2>;
          case 'subheader':
            return <h3 key={index} className="text-xl font-semibold my-2">{msg.content}</h3>;
          case 'bullet':
            return <li key={index} className="list-disc list-inside">{msg.content}</li>;
          case 'text':
            return <p key={index} className="my-2">{msg.content}</p>;
          default:
            return <p key={index}>{msg.content}</p>;
        }
      })}
    </div>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async () => {
    if (prompt.trim() !== '') {
      const userMessage: Message = { sender: 'user', text: prompt };
      setMessages([...messages, userMessage]);

      try {
        const response = await axios.post('http://localhost:5000/api/v1/ai/generate-text', { prompt });
        const geminiMessage: Message = { sender: 'gemini', text: response.data.text };
        setMessages((prevMessages) => [...prevMessages, geminiMessage]);
        setPrompt('');
      } catch (error) {
        console.error('Error sending prompt:', error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="bg-primary text-primary-foreground py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold">Gemini Chat</h1>
      </header>
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter Prompt</h2>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <Button
              onClick={handleSend}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Send
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} className={`p-4 border rounded-lg shadow-sm ${message.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <strong>{message.sender === 'user' ? 'You' : 'Gemini'}:</strong>
                {message.sender === 'gemini' ? (
                  <RenderMessage message={message.text} />
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
