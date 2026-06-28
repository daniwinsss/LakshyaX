import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Quest } from '../types';

interface D3ForceGraphProps {
  quests: Quest[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  quest: Quest;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export const D3ForceGraph: React.FC<D3ForceGraphProps> = ({ quests }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || quests.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // Clear previous drawing
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('width', '100%')
      .style('height', '100%');

    // Create a zoomable group
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const nodes: Node[] = quests.map(q => ({ id: q.id, quest: q }));
    const links: Link[] = [];

    quests.forEach(quest => {
      if (quest.dependencies) {
        quest.dependencies.forEach(depId => {
          if (quests.find(q => q.id === depId)) {
            links.push({
              source: depId,
              target: quest.id
            });
          }
        });
      }
    });

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3.forceLink<Node, Link>(links).id(d => d.id).distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(50));

    // Build the arrows
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#eab308')
      .style('stroke', 'none');

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#eab308')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    // Node circles
    node
      .append('circle')
      .attr('r', 16)
      .attr('fill', d => (d.quest.health === 0 ? '#10b981' : d.quest.type === 'boss' ? '#ef4444' : '#eab308'))
      .attr('stroke', d => d.quest.health === 0 ? '#059669' : '#ca8a04')
      .attr('stroke-width', 3)
      .style('cursor', 'grab');

    // Node labels
    const labelGroup = node.append('g').attr('transform', 'translate(22, 5)');
    
    // Background for label to ensure readability
    labelGroup
      .append('rect')
      .attr('x', -4)
      .attr('y', -14)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', d => d.quest.title.length * 7 + 10)
      .attr('height', 20)
      .attr('fill', '#16130e')
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#eab308')
      .attr('stroke-opacity', 0.2);

    labelGroup
      .append('text')
      .text(d => d.quest.title)
      .attr('fill', '#fdfcf9')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-family', 'Inter, sans-serif')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).select('circle').style('cursor', 'grabbing');
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(this).select('circle').style('cursor', 'grab');
      }

      return d3
        .drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [quests]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] flex-1 relative rounded-3xl overflow-hidden glass-card bg-[#16130e]/95 border border-yellow-500/15 shadow-xl">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-mono font-bold text-yellow-500 uppercase tracking-widest">
          Network Topology
        </h3>
        <p className="text-[10px] font-mono text-[#b8b3a0]/50 mt-1">D3 Force-Directed Graph</p>
      </div>
      <div className="absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] font-mono font-bold">
        <div className="flex items-center gap-1.5 text-[#b8b3a0]">
          <div className="w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#059669]"></div> Done
        </div>
        <div className="flex items-center gap-1.5 text-[#b8b3a0]">
          <div className="w-3 h-3 rounded-full bg-[#eab308] border-2 border-[#ca8a04]"></div> Active
        </div>
        <div className="flex items-center gap-1.5 text-[#b8b3a0]">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-[#b91c1c]"></div> Boss
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full bg-[#0a0907]/50" />
    </div>
  );
};
