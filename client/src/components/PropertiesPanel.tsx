import { useState, useEffect } from "react";
import { Settings, Copy, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { FlowNode, FlowEdge } from "@/lib/flowTypes";

interface PropertiesPanelProps {
  selectedNode: FlowNode | null;
  onUpdateNode: (nodeId: string, data: Partial<FlowNode["data"]>) => void;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  edges: FlowEdge[];
}

export function PropertiesPanel({ 
  selectedNode, 
  onUpdateNode, 
  onDuplicateNode, 
  onDeleteNode,
  edges 
}: PropertiesPanelProps) {
  const [localData, setLocalData] = useState(selectedNode?.data || {});

  useEffect(() => {
    setLocalData(selectedNode?.data || {});
  }, [selectedNode]);

  const handleDataChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    if (selectedNode) {
      onUpdateNode(selectedNode.id, newData);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "start": return "cyber-green";
      case "message": return "cyber-blue";
      case "question": return "cyber-pink";
      default: return "cyber-blue";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "start": return "▶";
      case "message": return "💬";
      case "question": return "❓";
      default: return "⚙";
    }
  };

  // Generate flow preview
  const getFlowPreview = () => {
    if (!selectedNode) return [];
    
    const nodeConnections = edges.filter(edge => 
      edge.source === selectedNode.id || edge.target === selectedNode.id
    );
    
    return nodeConnections.map(edge => ({
      type: edge.source === selectedNode.id ? "outgoing" : "incoming",
      nodeId: edge.source === selectedNode.id ? edge.target : edge.source,
    }));
  };

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-[hsl(var(--cyber-navy),0.3)] border-l border-[hsl(var(--cyber-blue),0.3)] backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-[hsl(var(--cyber-purple))] text-lg font-semibold mb-6 glitch-text flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Properties Panel
          </h2>
          <div className="text-center text-gray-400 mt-12">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a node to edit its properties</p>
          </div>
        </div>
      </aside>
    );
  }

  const nodeColor = getNodeColor(selectedNode.type);

  return (
    <aside className="w-80 bg-[hsl(var(--cyber-navy),0.3)] border-l border-[hsl(var(--cyber-blue),0.3)] backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-[hsl(var(--cyber-purple))] text-lg font-semibold mb-6 glitch-text flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Properties Panel
        </h2>
        
        {/* Node Properties */}
        <div className={`hologram rounded-lg border border-[hsl(var(--${nodeColor}),0.3)] p-4 mb-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-6 h-6 bg-[hsl(var(--${nodeColor}))] rounded-full flex items-center justify-center`}>
              <span className="text-[hsl(var(--cyber-dark))] text-xs">{getNodeIcon(selectedNode.type)}</span>
            </div>
            <span className={`text-[hsl(var(--${nodeColor}))] font-medium capitalize`}>
              {selectedNode.type} Block
            </span>
          </div>
          
          <div className="space-y-4">
            {selectedNode.type !== "start" && (
              <div>
                <Label className="text-sm text-gray-400 mb-2">
                  {selectedNode.type === "message" ? "Message Text" : "Question Text"}
                </Label>
                <Textarea
                  value={localData.text || ""}
                  onChange={(e) => handleDataChange("text", e.target.value)}
                  placeholder={`Enter your ${selectedNode.type}...`}
                  className="bg-[hsl(var(--cyber-dark),0.5)] border-[hsl(var(--cyber-pink),0.5)] text-white placeholder-gray-500 focus:border-[hsl(var(--cyber-pink))] resize-none"
                  rows={3}
                />
              </div>
            )}
            
            {selectedNode.type === "question" && (
              <>
                <div>
                  <Label className="text-sm text-gray-400 mb-2">Input Type</Label>
                  <Select 
                    value={localData.inputType || "text"} 
                    onValueChange={(value) => handleDataChange("inputType", value)}
                  >
                    <SelectTrigger className="bg-[hsl(var(--cyber-dark),0.5)] border-[hsl(var(--cyber-pink),0.5)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--cyber-navy))] border-[hsl(var(--cyber-pink),0.5)]">
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-400 mb-2">Validation</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={localData.required || false}
                        onCheckedChange={(checked) => handleDataChange("required", checked)}
                        className="border-[hsl(var(--cyber-pink),0.5)]"
                      />
                      <span className="text-sm text-white">Required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={localData.storeResponse || false}
                        onCheckedChange={(checked) => handleDataChange("storeResponse", checked)}
                        className="border-[hsl(var(--cyber-pink),0.5)]"
                      />
                      <span className="text-sm text-white">Store Response</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Node Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => onDuplicateNode(selectedNode.id)}
            className="w-full bg-[hsl(var(--cyber-purple),0.2)] border border-[hsl(var(--cyber-purple))] text-[hsl(var(--cyber-purple))] hover:bg-[hsl(var(--cyber-purple),0.3)] hover:shadow-lg hover:shadow-[hsl(var(--cyber-purple),0.5)]"
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Block
          </Button>
          
          {selectedNode.type !== "start" && (
            <Button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="w-full bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/50"
              variant="outline"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Block
            </Button>
          )}
        </div>
        
        {/* Flow Preview */}
        <div className="mt-8 hologram rounded-lg border border-[hsl(var(--cyber-blue),0.3)] p-4">
          <h3 className="text-[hsl(var(--cyber-blue))] font-medium mb-3 flex items-center">
            <GitBranch className="w-4 h-4 mr-2" />
            Flow Preview
          </h3>
          <div className="text-xs text-gray-400 space-y-1">
            {getFlowPreview().length === 0 ? (
              <div className="text-center py-4">
                <span>No connections</span>
              </div>
            ) : (
              getFlowPreview().map((connection, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connection.type === "outgoing" ? "bg-[hsl(var(--cyber-green))]" : "bg-[hsl(var(--cyber-blue))]"
                  }`}></div>
                  <span>
                    {connection.type === "outgoing" ? "Connects to" : "Receives from"} {connection.nodeId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
