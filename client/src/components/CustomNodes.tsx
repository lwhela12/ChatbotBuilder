import { Handle, Position } from "reactflow";
import { Edit3, Play, MessageCircle, HelpCircle } from "lucide-react";

interface NodeData {
  text?: string;
  inputType?: string;
  required?: boolean;
  storeResponse?: boolean;
}

interface CustomNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
  onEdit?: (nodeId: string) => void;
}

export function StartNode({ data, selected, id, onEdit }: CustomNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div 
      className={`
        relative min-w-[200px] p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-[hsl(var(--cyber-green),0.2)] border-[hsl(var(--cyber-green))]
        ${selected ? 'neon-glow-green transform scale-105' : 'shadow-lg shadow-[hsl(var(--cyber-green),0.3)]'}
        hover:transform hover:scale-102 hover:shadow-lg hover:shadow-[hsl(var(--cyber-green),0.5)]
      `}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[hsl(var(--cyber-green))] rounded-full flex items-center justify-center">
            <Play className="w-3 h-3 text-[hsl(var(--cyber-dark))]" />
          </div>
          <span className="text-[hsl(var(--cyber-green))] font-medium">Start</span>
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 hover:text-[hsl(var(--cyber-green))]" />
      </div>
      <div className="text-sm text-gray-300 italic">
        {data.text || "Click to set welcome message..."}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[hsl(var(--cyber-green))] !border-2 !border-[hsl(var(--cyber-dark))]"
      />
    </div>
  );
}

export function MessageNode({ data, selected, id, onEdit }: CustomNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div 
      className={`
        relative min-w-[200px] p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-[hsl(var(--cyber-blue),0.2)] border-[hsl(var(--cyber-blue))]
        ${selected ? 'neon-glow-blue transform scale-105' : 'shadow-lg shadow-[hsl(var(--cyber-blue),0.3)]'}
        hover:transform hover:scale-102 hover:shadow-lg hover:shadow-[hsl(var(--cyber-blue),0.5)]
      `}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[hsl(var(--cyber-blue))] !border-2 !border-[hsl(var(--cyber-dark))]"
      />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[hsl(var(--cyber-blue))] rounded-full flex items-center justify-center">
            <MessageCircle className="w-3 h-3 text-[hsl(var(--cyber-dark))]" />
          </div>
          <span className="text-[hsl(var(--cyber-blue))] font-medium">Message</span>
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[hsl(var(--cyber-blue))]" />
      </div>
      <div className="text-sm text-gray-300 italic">
        {data.text || "Click to edit message..."}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[hsl(var(--cyber-blue))] !border-2 !border-[hsl(var(--cyber-dark))]"
      />
    </div>
  );
}

export function QuestionNode({ data, selected, id, onEdit }: CustomNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div 
      className={`
        relative min-w-[200px] p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
        bg-[hsl(var(--cyber-pink),0.2)] border-[hsl(var(--cyber-pink))]
        ${selected ? 'neon-glow-pink transform scale-105' : 'shadow-lg shadow-[hsl(var(--cyber-pink),0.3)]'}
        hover:transform hover:scale-102 hover:shadow-lg hover:shadow-[hsl(var(--cyber-pink),0.5)]
      `}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[hsl(var(--cyber-pink))] !border-2 !border-[hsl(var(--cyber-dark))]"
      />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[hsl(var(--cyber-pink))] rounded-full flex items-center justify-center">
            <HelpCircle className="w-3 h-3 text-[hsl(var(--cyber-dark))]" />
          </div>
          <span className="text-[hsl(var(--cyber-pink))] font-medium">Question</span>
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[hsl(var(--cyber-pink))]" />
      </div>
      <div className="text-sm text-gray-300 italic">
        {data.text || "Click to edit question..."}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Expects: {data.inputType || "Text Input"}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[hsl(var(--cyber-pink))] !border-2 !border-[hsl(var(--cyber-dark))]"
      />
    </div>
  );
}

export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  question: QuestionNode,
};
