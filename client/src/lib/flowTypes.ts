export interface FlowNode {
  id: string;
  type: "start" | "message" | "question";
  position: { x: number; y: number };
  data: {
    text?: string;
    inputType?: string;
    required?: boolean;
    storeResponse?: boolean;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ChatMessage {
  id: string;
  type: "bot" | "user";
  text: string;
  nodeId?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  currentNodeId: string | null;
  isWaitingForInput: boolean;
  flowData: FlowData | null;
}
