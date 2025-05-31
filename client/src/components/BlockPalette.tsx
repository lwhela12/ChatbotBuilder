import { Play, MessageCircle, HelpCircle, BarChart3 } from "lucide-react";

interface BlockPaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  flowStats: {
    totalBlocks: number;
    totalConnections: number;
    lastSaved: string;
  };
}

export function BlockPalette({ onDragStart, flowStats }: BlockPaletteProps) {
  const blockTypes = [
    {
      type: "start",
      name: "Start Block",
      description: "Entry point for conversation",
      icon: Play,
      color: "cyber-green",
    },
    {
      type: "message",
      name: "Message Block", 
      description: "Display text message",
      icon: MessageCircle,
      color: "cyber-blue",
    },
    {
      type: "question",
      name: "Question Block",
      description: "Collect user input",
      icon: HelpCircle,
      color: "cyber-pink",
    },
  ];

  return (
    <aside className="w-80 bg-[hsl(var(--cyber-navy),0.3)] border-r border-[hsl(var(--cyber-blue),0.3)] backdrop-blur-sm overflow-y-auto">
      <div className="p-6">
        <h2 className="text-[hsl(var(--cyber-blue))] text-lg font-semibold mb-6 glitch-text flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Block Palette
        </h2>
        
        <div className="space-y-4">
          {blockTypes.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.type}
                className={`
                  bg-[hsl(var(--${block.color}),0.1)] border border-[hsl(var(--${block.color}))]
                  rounded-lg p-4 cursor-grab hover:cursor-grabbing transition-all duration-300
                  hover:transform hover:scale-105 hover:shadow-lg hover:shadow-[hsl(var(--${block.color}),0.5)]
                `}
                draggable
                onDragStart={(e) => {
                  onDragStart(e, block.type);
                  e.dataTransfer.setData("application/reactflow", block.type);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-[hsl(var(--${block.color}),0.2)] rounded-full flex items-center justify-center`}>
                    <Icon className={`text-[hsl(var(--${block.color}))] w-4 h-4`} />
                  </div>
                  <div>
                    <div className={`text-[hsl(var(--${block.color}))] font-medium`}>
                      {block.name}
                    </div>
                    <div className="text-xs text-gray-400">{block.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Flow Stats */}
        <div className="mt-8 p-4 hologram rounded-lg border border-[hsl(var(--cyber-purple),0.3)]">
          <h3 className="text-[hsl(var(--cyber-purple))] font-medium mb-3">Flow Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Blocks:</span>
              <span className="text-white">{flowStats.totalBlocks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connections:</span>
              <span className="text-white">{flowStats.totalConnections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Saved:</span>
              <span className="text-white">{flowStats.lastSaved}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
