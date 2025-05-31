import { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  type OnConnect,
  type NodeDragHandler,
  type OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./CustomNodes";
import type { FlowNode, FlowEdge } from "@/lib/flowTypes";

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: (nodes: FlowNode[]) => void;
  onEdgesChange: (edges: FlowEdge[]) => void;
  onConnect: (edge: FlowEdge) => void;
  onNodeSelect: (node: FlowNode | null) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onEditNode: (nodeId: string) => void;
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onDrop,
  onDragOver,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowNodes, setReactFlowNodes, onReactFlowNodesChange] = useNodesState(nodes as Node[]);
  const [reactFlowEdges, setReactFlowEdges, onReactFlowEdgesChange] = useEdgesState(edges as Edge[]);

  // Update React Flow nodes when props change
  useEffect(() => {
    setReactFlowNodes(nodes as Node[]);
  }, [nodes, setReactFlowNodes]);

  // Update React Flow edges when props change
  useEffect(() => {
    setReactFlowEdges(edges as Edge[]);
  }, [edges, setReactFlowEdges]);

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        const newEdge: FlowEdge = {
          id: `edge-${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined,
        };
        onConnect(newEdge);
      }
    },
    [onConnect]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onReactFlowNodesChange(changes);
      // Convert React Flow nodes back to our format
      const updatedNodes = reactFlowNodes.map(node => ({
        id: node.id,
        type: node.type as "start" | "message" | "question",
        position: node.position,
        data: node.data,
      }));
      onNodesChange(updatedNodes);
    },
    [onReactFlowNodesChange, reactFlowNodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onReactFlowEdgesChange(changes);
      // Convert React Flow edges back to our format
      const updatedEdges = reactFlowEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      }));
      onEdgesChange(updatedEdges);
    },
    [onReactFlowEdgesChange, reactFlowEdges, onEdgesChange]
  );

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (params.nodes.length > 0) {
        const selectedNode = params.nodes[0];
        onNodeSelect({
          id: selectedNode.id,
          type: selectedNode.type as "start" | "message" | "question",
          position: selectedNode.position,
          data: selectedNode.data,
        });
      } else {
        onNodeSelect(null);
      }
    },
    [onNodeSelect]
  );

  return (
    <div className="flex-1 relative cyber-grid bg-[hsl(var(--cyber-dark))] w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={handleSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="font-cyber w-full h-full"
      >
        <Background 
          color="hsl(var(--cyber-blue))"
          gap={50}
          size={1}
          className="opacity-20"
        />
        <Controls 
          className="bg-[hsl(var(--cyber-navy),0.8)] border border-[hsl(var(--cyber-blue),0.5)]"
        />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvasWrapper(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
