import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { NetworkNode, NetworkEdge } from '@/types';

const sampleNodes: NetworkNode[] = [
  { id: 'subject', label: 'SPECTER-7', type: 'subject', classification: 'A', interactionCount: 200 },
  { id: 'contact1', label: 'CONTACT_ECHO', type: 'contact', classification: 'A', interactionCount: 47 },
  { id: 'contact2', label: 'UNKNOWN_7', type: 'contact', classification: 'B', interactionCount: 23 },
  { id: 'contact3', label: 'CONTACT_PHANTOM', type: 'contact', classification: 'A', interactionCount: 15 },
  { id: 'entity1', label: 'PARTNER', type: 'entity', classification: 'E', interactionCount: 156 },
  { id: 'target1', label: 'ENTITY_ECHO', type: 'target', classification: 'A', interactionCount: 89 },
  { id: 'contact4', label: 'UNKNOWN_12', type: 'contact', classification: 'C', interactionCount: 8 },
  { id: 'contact5', label: 'WORK_CONTACT_1', type: 'entity', classification: 'F', interactionCount: 34 },
  { id: 'contact6', label: 'FAMILY_1', type: 'entity', classification: 'E', interactionCount: 67 },
  { id: 'target2', label: 'TINDER_MATCH_3', type: 'target', classification: 'B', interactionCount: 12 },
];

const sampleEdges: NetworkEdge[] = [
  { source: 'subject', target: 'contact1', weight: 47, platform: 'whatsapp' },
  { source: 'subject', target: 'contact2', weight: 23, platform: 'telegram' },
  { source: 'subject', target: 'contact3', weight: 15, platform: 'signal' },
  { source: 'subject', target: 'entity1', weight: 156, platform: 'imessage' },
  { source: 'subject', target: 'target1', weight: 89, platform: 'instagram' },
  { source: 'subject', target: 'contact4', weight: 8, platform: 'venmo' },
  { source: 'subject', target: 'contact5', weight: 34, platform: 'cellular' },
  { source: 'subject', target: 'contact6', weight: 67, platform: 'imessage' },
  { source: 'subject', target: 'target2', weight: 12, platform: 'tinder' },
  { source: 'contact1', target: 'target1', weight: 5, platform: 'instagram' },
  { source: 'contact3', target: 'contact2', weight: 3, platform: 'telegram' },
];

const CLASSIFICATION_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#3b82f6', E: '#22c55e', F: '#6b7280',
};
const TYPE_SHAPES: Record<string, string> = {
  subject: '◆', contact: '●', target: '▲', entity: '■',
};

export const NetworkView = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = useMemo(() => sampleNodes.map((n) => ({ ...n })), []);
  const edges = useMemo(() => sampleEdges.map((e) => ({ ...e })), []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    svg.attr('width', w).attr('height', h);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoomBehavior);

    const sim = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges as any).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(25));

    const link = g.selectAll('.link')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(25, 40%, 18%)')
      .attr('stroke-width', (d: any) => Math.max(0.5, d.weight / 40))
      .attr('stroke-opacity', 0.5);

    const node = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d: any) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d: any) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d: any) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', (d: any) => 6 + (d.interactionCount / 200) * 10)
      .attr('fill', (d: any) => CLASSIFICATION_COLORS[d.classification] || '#6b7280')
      .attr('fill-opacity', 0.2)
      .attr('stroke', (d: any) => CLASSIFICATION_COLORS[d.classification] || '#6b7280')
      .attr('stroke-width', 1.5);

    node.append('text')
      .text((d: any) => d.label)
      .attr('dy', (d: any) => 6 + (d.interactionCount / 200) * 10 + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'hsl(220, 10%, 40%)');

    node.append('text')
      .text((d: any) => TYPE_SHAPES[d.type] || '●')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 10)
      .attr('fill', (d: any) => CLASSIFICATION_COLORS[d.classification] || '#6b7280');

    sim.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); };
  }, [nodes, edges]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-background/50">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 text-[9px] font-mono text-muted-foreground">
        ◆ SOCIAL NETWORK — {nodes.length} NODES • {edges.length} EDGES
      </div>
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        {Object.entries(TYPE_SHAPES).map(([type, shape]) => (
          <div key={type} className="text-[8px] font-mono text-muted-foreground flex items-center gap-1.5">
            <span>{shape}</span> {type.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};
