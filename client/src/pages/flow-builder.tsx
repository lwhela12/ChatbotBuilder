import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bot, Save, Download, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BlockPalette } from "@/components/BlockPalette";
import { FlowCanvasWrapper } from "@/components/FlowCanvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import type { FlowData, FlowNode, FlowEdge } from "@/lib/flowTypes";

export default function FlowBuilder() {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Local state
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Never");
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [welcomePromptShown, setWelcomePromptShown] = useState(false);

  // Load flow data
  const { data: flowData, isLoading } = useQuery({
    queryKey: ["/api/flow"],
    queryFn: async () => {
      const response = await fetch("/api/flow");
      if (!response.ok) throw new Error("Failed to load flow");
      return response.json();
    },
  });

  // Initialize nodes and edges when flow data loads
  useEffect(() => {
    if (flowData) {
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
    }
  }, [flowData]);

  // Prompt for welcome message on first load if start node lacks text
  useEffect(() => {
    if (!welcomePromptShown && nodes.length > 0) {
      const startNode = nodes.find((n) => n.type === "start");
      if (startNode && !startNode.data.text) {
        const msg = window.prompt("Enter a welcome message for this flow:", "");
        if (msg) {
          handleUpdateNode(startNode.id, { text: msg });
        }
      }
      if (startNode) {
        setWelcomePromptShown(true);
      }
    }
  }, [nodes, welcomePromptShown, handleUpdateNode]);

  // Save flow mutation
  const saveFlowMutation = useMutation({
    mutationFn: async (flowData: FlowData) => {
      const response = await apiRequest("POST", "/api/flow", flowData);
      return response.json();
    },
    onSuccess: () => {
      setLastSaved(new Date().toLocaleTimeString());
      toast({
        title: "Flow Saved",
        description: "Your chatbot flow has been saved successfully!",
        className: "bg-[hsl(var(--cyber-green),0.2)] border-[hsl(var(--cyber-green))] text-[hsl(var(--cyber-green))]",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/flow"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save flow. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate unique ID for new nodes
  const generateNodeId = (type: string) => {
    const existingNodes = nodes.filter(node => node.type === type);
    return `${type}-node-${existingNodes.length + 1}`;
  };

  // Handle drag start from palette
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setDraggedNodeType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      // Get the canvas element to calculate relative position
      const canvasElement = event.currentTarget as HTMLElement;
      const rect = canvasElement.getBoundingClientRect();
      
      const position = {
        x: event.clientX - rect.left - 100,
        y: event.clientY - rect.top - 50,
      };

      const newNode: FlowNode = {
        id: generateNodeId(nodeType),
        type: nodeType as "start" | "message" | "question",
        position,
        data: {
          text: nodeType === "start" ? undefined : `Enter your ${nodeType}...`,
        },
      };

      if (nodeType === "start") {
        const msg = window.prompt("Enter a welcome message for this flow:", "");
        if (msg) {
          newNode.data.text = msg;
        }
      }

      setNodes(prev => [...prev, newNode]);
    },
    [nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle node updates
  const handleUpdateNode = useCallback((nodeId: string, data: Partial<FlowNode["data"]>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    ));
  }, []);

  // Handle node duplication
  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: FlowNode = {
      ...nodeToDuplicate,
      id: generateNodeId(nodeToDuplicate.type),
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
    };

    setNodes(prev => [...prev, newNode]);
  }, [nodes]);

  // Handle node deletion
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Handle new connections
  const handleConnect = useCallback((edge: FlowEdge) => {
    setEdges(prev => [...prev, edge]);
  }, []);

  // Save flow
  const handleSaveFlow = () => {
    const flowData: FlowData = { nodes, edges };
    saveFlowMutation.mutate(flowData);
  };

  // Load flow
  const handleLoadFlow = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/flow"] });
    toast({
      title: "Flow Loaded",
      description: "Flow data has been refreshed from the server.",
      className: "bg-[hsl(var(--cyber-blue),0.2)] border-[hsl(var(--cyber-blue))] text-[hsl(var(--cyber-blue))]",
    });
  };

  // Test bot
  const handleTestBot = () => {
    if (nodes.length === 0) {
      toast({
        title: "No Flow to Test",
        description: "Please create a flow before testing the bot.",
        variant: "destructive",
      });
      return;
    }
    setIsChatbotVisible(true);
  };

  const flowStats = {
    totalBlocks: nodes.length,
    totalConnections: edges.length,
    lastSaved,
  };

  const currentFlowData: FlowData = { nodes, edges };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--cyber-dark))] flex items-center justify-center">
        <div className="text-[hsl(var(--cyber-blue))] text-lg glitch-text">Loading flow builder...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--cyber-dark))] text-white font-mono">
      {/* Header */}
      <header className="border-b border-[hsl(var(--cyber-blue),0.3)] bg-[hsl(var(--cyber-navy),0.5)] backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="text-[hsl(var(--cyber-blue))] text-2xl font-bold glitch-text flex items-center">
              <Bot className="w-8 h-8 mr-2" />
              CyberBot Builder
            </div>
            <div className="text-[hsl(var(--cyber-green))] text-sm opacity-70">v2.0.1</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSaveFlow}
              disabled={saveFlowMutation.isPending}
              className="bg-[hsl(var(--cyber-green),0.2)] border border-[hsl(var(--cyber-green))] text-[hsl(var(--cyber-green))] hover:bg-[hsl(var(--cyber-green),0.3)] hover:shadow-lg hover:shadow-[hsl(var(--cyber-green),0.5)]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveFlowMutation.isPending ? "Saving..." : "Save Flow"}
            </Button>
            
            <Button
              onClick={handleLoadFlow}
              className="bg-[hsl(var(--cyber-purple),0.2)] border border-[hsl(var(--cyber-purple))] text-[hsl(var(--cyber-purple))] hover:bg-[hsl(var(--cyber-purple),0.3)] hover:shadow-lg hover:shadow-[hsl(var(--cyber-purple),0.5)]"
            >
              <Download className="w-4 h-4 mr-2" />
              Load Flow
            </Button>
            
            <Button
              onClick={handleTestBot}
              className="bg-[hsl(var(--cyber-pink),0.2)] border border-[hsl(var(--cyber-pink))] text-[hsl(var(--cyber-pink))] hover:bg-[hsl(var(--cyber-pink),0.3)] hover:shadow-lg hover:shadow-[hsl(var(--cyber-pink),0.5)]"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Bot
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Block Palette */}
        <BlockPalette onDragStart={onDragStart} flowStats={flowStats} />

        {/* Main Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <FlowCanvasWrapper
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onConnect={handleConnect}
            onNodeSelect={setSelectedNode}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDuplicateNode={handleDuplicateNode}
          onDeleteNode={handleDeleteNode}
          edges={edges}
        />
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget
        flowData={currentFlowData}
        isVisible={isChatbotVisible}
        onClose={() => setIsChatbotVisible(false)}
      />
    </div>
  );
}
