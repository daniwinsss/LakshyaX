import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface RoadmapGraphProps {
  quests: Quest[];
}

interface GraphNode {
  quest: Quest;
  layer: number;
  x: number;
  y: number;
}

export default function RoadmapGraph({ quests }: RoadmapGraphProps) {
  // Compute layers and layout
  const { nodes, edges, maxLayer } = useMemo(() => {
    // 1. Build adjacency list and in-degrees
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    const questMap: Record<string, Quest> = {};
    
    quests.forEach(q => {
      questMap[q.id] = q;
      if (!adj[q.id]) adj[q.id] = [];
      if (!inDegree[q.id]) inDegree[q.id] = 0;
      
      q.dependencies?.forEach(depId => {
        if (!adj[depId]) adj[depId] = [];
        adj[depId].push(q.id);
        
        if (!inDegree[q.id]) inDegree[q.id] = 0;
        inDegree[q.id]++;
      });
    });

    // 2. Topological sort to assign layers
    const layers: Record<string, number> = {};
    const queue: string[] = [];
    
    // Find roots
    quests.forEach(q => {
      if (inDegree[q.id] === 0) {
        queue.push(q.id);
        layers[q.id] = 0;
      }
    });
    
    let maxLayer = 0;
    while (queue.length > 0) {
      const u = queue.shift()!;
      
      adj[u].forEach(v => {
        layers[v] = Math.max(layers[v] || 0, layers[u] + 1);
        maxLayer = Math.max(maxLayer, layers[v]);
        
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      });
    }

    // 3. Layout nodes (x, y)
    const layerCounts: Record<number, number> = {};
    const nodesList: GraphNode[] = [];
    
    // Sort quests by layer, then by estimated hours descending (arbitrary stable sort)
    const sortedQuests = [...quests].sort((a, b) => {
      if (layers[a.id] !== layers[b.id]) return (layers[a.id] || 0) - (layers[b.id] || 0);
      return (b.estimatedHours || 0) - (a.estimatedHours || 0);
    });
    
    const X_SPACING = 300;
    const Y_SPACING = 150;
    
    sortedQuests.forEach(q => {
      const l = layers[q.id] || 0;
      if (!layerCounts[l]) layerCounts[l] = 0;
      
      nodesList.push({
        quest: q,
        layer: l,
        x: l * X_SPACING + 150, // Base offset
        y: layerCounts[l] * Y_SPACING + 100 // Base offset
      });
      
      layerCounts[l]++;
    });
    
    // Center Y axis per layer
    const maxNodesInLayer = Math.max(...Object.values(layerCounts));
    nodesList.forEach(node => {
      const totalInLayer = layerCounts[node.layer];
      const yOffset = ((maxNodesInLayer - totalInLayer) * Y_SPACING) / 2;
      node.y += yOffset;
    });

    // 4. Create Edges
    const edgesList: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    nodesList.forEach(node => {
      node.quest.dependencies?.forEach(depId => {
        const sourceNode = nodesList.find(n => n.quest.id === depId);
        if (sourceNode) {
          edgesList.push({
            id: `${sourceNode.quest.id}-${node.quest.id}`,
            x1: sourceNode.x + 120, // offset to right side of card
            y1: sourceNode.y,
            x2: node.x - 120, // offset to left side of card
            y2: node.y
          });
        }
      });
    });

    return { nodes: nodesList, edges: edgesList, maxLayer };
  }, [quests]);

  const SVG_WIDTH = Math.max(1000, (maxLayer + 1) * 300 + 300);
  const SVG_HEIGHT = Math.max(500, Math.max(...nodes.map(n => n.y)) + 200);

  return (
    <div className="w-full h-full min-h-[500px] overflow-auto bg-black/40 border border-yellow-500/20 rounded-3xl relative backdrop-blur-sm p-8">
      <div className="mb-4 absolute top-6 left-6 z-10 flex flex-col gap-1">
        <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <Clock size={20} /> Tactical Roadmap
        </h3>
        <p className="text-xs text-yellow-500/60 font-mono">OPTIMAL CRITICAL PATH GENERATED</p>
      </div>

      <div style={{ width: SVG_WIDTH, height: SVG_HEIGHT }} className="relative mx-auto mt-12">
        {/* Edges SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: SVG_WIDTH, minHeight: SVG_HEIGHT }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(234, 179, 8, 0.4)" />
            </marker>
          </defs>
          {edges.map(edge => {
            // Calculate bezier curve points
            const midX = (edge.x1 + edge.x2) / 2;
            const path = `M ${edge.x1} ${edge.y1} C ${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`;
            return (
              <motion.path
                key={edge.id}
                d={path}
                fill="none"
                stroke="rgba(234, 179, 8, 0.3)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node, i) => {
          const isDone = node.quest.health === 0;
          
          // Determine if this is the "Next Critical Action"
          // It is the next critical action if it's not done, AND all its dependencies are done.
          const allDepsDone = !node.quest.dependencies || node.quest.dependencies.every(depId => {
            const depQuest = quests.find(q => q.id === depId);
            return !depQuest || depQuest.health === 0;
          });
          const isNextCritical = !isDone && allDepsDone;

          return (
            <div
              key={node.quest.id}
              className="absolute"
              style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: node.layer * 0.2, duration: 0.5, type: 'spring' }}
                className="cursor-pointer"
              >
                <div className={`w-64 p-4 rounded-2xl border backdrop-blur-md transition-all ${isDone ? 'bg-yellow-500/10 border-yellow-500/50' : isNextCritical ? 'bg-[#2a2415] border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-[#171510] border-yellow-500/20'}`}>
                  {isNextCritical && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md animate-pulse">
                      Next Critical Action
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-bold ${isDone ? 'text-yellow-400 line-through' : 'text-yellow-100'}`}>
                      {node.quest.title}
                    </h4>
                    {isDone ? (
                      <CheckCircle2 className="text-yellow-500 flex-shrink-0" size={18} />
                    ) : (
                      <Circle className="text-yellow-500/40 flex-shrink-0" size={18} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs mt-3">
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md font-mono">
                      Tier {node.layer}
                    </span>
                    {node.quest.estimatedHours && (
                      <span className="text-yellow-100/50 flex items-center gap-1">
                        <Clock size={12} /> {node.quest.estimatedHours}h
                      </span>
                    )}
                  </div>

                  <div className="mt-3 w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, 100 - (node.quest.health / node.quest.maxHealth) * 100)}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
