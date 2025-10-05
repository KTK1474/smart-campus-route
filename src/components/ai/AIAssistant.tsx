import { useState } from "react";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * AIAssistant - Context-aware floating chat widget
 * Provides intelligent guidance based on current map view and user actions
 * TODO: Connect to backend AI endpoint for real responses
 */
const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your EcoNav AI assistant. Ask me about routes, parking, or your eco-impact! 🌱",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // Call real AI backend with Gemini
      const { api } = await import('@/lib/api-client');
      const response = await api.chat(input, {
        current_page: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      const aiMessage = {
        role: "assistant",
        content: response.reply || "I apologize, I couldn't process that request.",
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="rounded-full w-14 h-14 shadow-glow bg-gradient-eco hover:scale-110 transition-transform"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="w-96 h-[500px] flex flex-col bg-card/95 backdrop-blur-md border-border shadow-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-eco">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">EcoNav AI</h3>
            <p className="text-xs text-white/80">Your smart campus guide</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by context-aware AI
        </p>
      </div>
    </Card>
  );
};

export default AIAssistant;
