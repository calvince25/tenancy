"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Paperclip, MoreVertical, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ChatInterface({ tenancy, initialMessages, currentUser }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser.role === "LANDLORD" ? tenancy.tenant : tenancy.landlord;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const content = input;
    setInput("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenancyId: tenancy.id,
          content,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev: any) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5]">
      {/* Header */}
      <header className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-accent/20">
            <AvatarFallback className="bg-accent/5 text-accent font-serif">
              {otherUser.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-serif text-lg text-primary leading-none">{otherUser.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-muted px-4 py-2 rounded-full text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Messages are permanent and stored for your records
          </div>
        </div>

        {messages.map((msg: any) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col space-y-1 max-w-[85%] md:max-w-[70%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 shadow-sm",
                isMe 
                  ? "bg-primary text-white rounded-2xl rounded-tr-none" 
                  : "bg-white border border-muted text-foreground rounded-2xl rounded-tl-none"
              )}>
                {msg.type === "OFFICIAL_NOTICE" && (
                  <div className="mb-2 p-2 bg-white/10 rounded-lg border border-white/20 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Official Notice</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {format(new Date(msg.sentAt), "h:mm a")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t pb-8 md:pb-4">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-muted-foreground shrink-0">
            <Plus className="w-6 h-6" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="pr-12 py-6 bg-muted/30 border-none focus-visible:ring-accent rounded-2xl"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-xl bg-accent hover:bg-accent/90 text-white p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
