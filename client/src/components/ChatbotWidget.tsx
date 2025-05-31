import { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FlowData, ChatMessage, FlowNode } from "@/lib/flowTypes";

interface ChatbotWidgetProps {
  flowData: FlowData | null;
  isVisible: boolean;
  onClose: () => void;
}

export function ChatbotWidget({ flowData, isVisible, onClose }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (flowData && isVisible) {
      startFlow();
    }
  }, [flowData, isVisible]);

  const startFlow = () => {
    if (!flowData) return;

    // Reset chat state
    setMessages([]);
    setCurrentInput("");
    setIsWaitingForInput(false);

    // Find start node
    const startNode = flowData.nodes.find(node => node.type === "start");
    if (startNode) {
      setCurrentNodeId(startNode.id);
      executeNode(startNode);
    }
  };

  const executeNode = (node: FlowNode) => {
    switch (node.type) {
      case "start":
        // Move to next connected node
        moveToNextNode(node.id);
        break;
        
      case "message":
        // Display message and move to next node
        if (node.data.text) {
          addBotMessage(node.data.text, node.id);
          setTimeout(() => moveToNextNode(node.id), 1000);
        }
        break;
        
      case "question":
        // Display question and wait for user input
        if (node.data.text) {
          addBotMessage(node.data.text, node.id);
          setIsWaitingForInput(true);
        }
        break;
    }
  };

  const moveToNextNode = (currentNodeId: string) => {
    if (!flowData) return;

    // Find the next connected node
    const nextEdge = flowData.edges.find(edge => edge.source === currentNodeId);
    if (nextEdge) {
      const nextNode = flowData.nodes.find(node => node.id === nextEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        executeNode(nextNode);
      }
    } else {
      // End of flow
      addBotMessage("Thank you! This conversation has ended.", "system");
      setIsWaitingForInput(false);
    }
  };

  const addBotMessage = (text: string, nodeId: string) => {
    const newMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: "bot",
      text,
      nodeId,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      text,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim() || !isWaitingForInput) return;

    // Add user message
    addUserMessage(currentInput);
    
    // Store response if needed
    const currentNode = flowData?.nodes.find(node => node.id === currentNodeId);
    if (currentNode?.data.storeResponse) {
      console.log(`Storing response for ${currentNode.id}:`, currentInput);
    }

    // Clear input and move to next node
    setCurrentInput("");
    setIsWaitingForInput(false);
    
    if (currentNodeId) {
      setTimeout(() => moveToNextNode(currentNodeId), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-[hsl(var(--cyber-navy),0.9)] backdrop-blur-sm border border-[hsl(var(--cyber-blue),0.5)] rounded-xl shadow-2xl shadow-[hsl(var(--cyber-blue),0.3)] z-50">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--cyber-blue),0.3)]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[hsl(var(--cyber-blue),0.2)] rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-[hsl(var(--cyber-blue))]" />
          </div>
          <span className="text-[hsl(var(--cyber-blue))] font-medium">Test Bot</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[hsl(var(--cyber-green))] rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Online</span>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chatbot ready to test your flow</p>
            <Button
              onClick={startFlow}
              className="mt-4 bg-[hsl(var(--cyber-blue),0.2)] border border-[hsl(var(--cyber-blue))] text-[hsl(var(--cyber-blue))] hover:bg-[hsl(var(--cyber-blue),0.3)]"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Flow
            </Button>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === "bot" 
                  ? "bg-[hsl(var(--cyber-blue),0.2)]" 
                  : "bg-[hsl(var(--cyber-green),0.2)]"
              }`}>
                {message.type === "bot" ? (
                  <Bot className="w-3 h-3 text-[hsl(var(--cyber-blue))]" />
                ) : (
                  <User className="w-3 h-3 text-[hsl(var(--cyber-green))]" />
                )}
              </div>
              <div className={`rounded-lg p-3 max-w-xs ${
                message.type === "bot"
                  ? "bg-[hsl(var(--cyber-blue),0.1)] border border-[hsl(var(--cyber-blue),0.3)]"
                  : "bg-[hsl(var(--cyber-green),0.1)] border border-[hsl(var(--cyber-green),0.3)]"
              }`}>
                <p className="text-sm text-gray-200">{message.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-[hsl(var(--cyber-blue),0.3)]">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={isWaitingForInput ? "Type your response..." : "Waiting for bot..."}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isWaitingForInput}
            className="flex-1 bg-[hsl(var(--cyber-dark),0.5)] border-[hsl(var(--cyber-blue),0.5)] text-white placeholder-gray-500 focus:border-[hsl(var(--cyber-blue))] text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isWaitingForInput || !currentInput.trim()}
            className="bg-[hsl(var(--cyber-blue),0.2)] border border-[hsl(var(--cyber-blue))] text-[hsl(var(--cyber-blue))] hover:bg-[hsl(var(--cyber-blue),0.3)] hover:shadow-lg hover:shadow-[hsl(var(--cyber-blue),0.5)]"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
