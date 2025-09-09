import React, { useRef, useEffect, useState } from 'react';
import * as d3Force from 'd3-force';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { quadtree as d3Quadtree } from 'd3-quadtree';
import 'd3-transition'; // for smoother drag transitions if desired

export default function D3NoteCloud({ notes, cloudMode, setSelectedNote }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const simRef = useRef();
  const [dim, setDim] = useState({ width: 300, height: 300 });

  function getChargeStrength(mode) {
    if (mode === 'clustered') return -30;
    if (mode === 'floating') return -10;
    return 0; // static
  }

  function getAlphaDecay(mode) {
    if (mode === 'static') return 0.1;
    if (mode === 'floating') return 0.02;
    return 0.01; // clustered
  }

  // 1) Resize handling
  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      setDim({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 2) Build the simulation (only when notes or size change)
  useEffect(() => {
    const boxWidth = 80;
    const boxHeight = 80;
    const fontSize = 12;

    const { width, height } = dim;
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous contents
    svg.selectAll('*').remove();

    // Prepare node data
    const nodes = notes.map(n => ({ id: n.id, width: boxWidth, height: boxHeight, ...n }));

    // Text wrapping helper
    function wrapText(text, maxChars) {
      const words = text.split(' ');
      const lines = [];
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (test.length > maxChars && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    // Limit text length for display
    function limitText(text, boxWidth) {
      const words = text.split(' ');
      const lines = [];
      let line = '';

      for (let i = 0; i < words.length; i++) {
        line += words[i];
        if (words[i].length > boxWidth / 8) {
          const len = boxWidth / 9;
          return line.substring(0, len) + '...';
        }
        else if (line.length > 30) {
          return line + '...';
        }
        line += ' ';
      }
      return line;
    }

    // Collision detection using quadtree
    function rectangleCollide(padding) {
      let nodes;
      function force(alpha) {
        const quad = d3Quadtree(nodes, d => d.x, d => d.y);
        for (const d of nodes) {
          quad.visit((q, x1, y1, x2, y2) => {
            if (!q.data || q.data === d) return false;
            // vector between the two node centers
            let x = d.x - q.data.x;
            let y = d.y - q.data.y;
            const absX = Math.abs(x);
            const absY = Math.abs(y);

            // how much space they need (half-width + half-width + padding)
            const xSpacing = padding + (d.width + q.data.width) / 2;
            const ySpacing = padding + (d.height + q.data.height) / 2;

            // if their boxes overlap
            if (absX < xSpacing && absY < ySpacing) {
              // push them apart along the smaller overlap axis
              const overlapX = xSpacing - absX;
              const overlapY = ySpacing - absY;

              if (overlapX < overlapY) {
                const shift = (overlapX * alpha) * (x < 0 ? -1 : 1);
                d.x -= shift;
                q.data.x += shift;
              } else {
                const shift = (overlapY * alpha) * (y < 0 ? -1 : 1);
                d.y -= shift;
                q.data.y += shift;
              }
            }
            return false;
          });
        }
      }
      force.initialize = _ => (nodes = _);
      return force;
    }

    // Simulation setup
    const sim = d3Force.forceSimulation(nodes)
      .force('charge', d3Force.forceManyBody().strength(getChargeStrength(cloudMode)))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collide', rectangleCollide(10))
      .force('bound', () => {
        // Confine nodes inside a circle of radius R
        const R = Math.min(width, height) / 2 - 30;
        return () => {
          nodes.forEach(d => {
            const dx = d.x - width / 2, dy = d.y - height / 2;
            const dist = Math.hypot(dx, dy);
            if (dist > R) {
              d.x = width / 2 + (dx / dist) * R;
              d.y = height / 2 + (dy / dist) * R;
            }
          });
        };
      })
      .alphaDecay(getAlphaDecay(cloudMode))
      .on('tick', ticked);

    simRef.current = sim;

    // If static mode, stop after layout
    if (cloudMode === 'static') {
      setTimeout(() => sim.stop(), 1000);
    }

    // Draw/update on each tick
    function ticked() {
      const u = svg.selectAll('g.node')
        .data(nodes, d => d.id);

      // Enter
      const gEnter = u.enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'pointer')
        .call(drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
        )
        .on('click', (event, d) => setSelectedNote(d));

      // Rect background
      gEnter.append('rect')
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('x', -40)
        .attr('y', -25)
        .attr('fill', 'white')
        .attr('stroke', 'black')

      // Wrapped text
      gEnter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font', d => d.title
          ? `bold 12px sans-serif`
          : `12px sans-serif`
        )
        .each(function (note) {
          const lines = wrapText(limitText(note.title ? note.title : note.content, boxWidth), 12);
          lines.forEach((line, i) => {
            select(this)
              .append('tspan')
              .attr('x', 0)
              .attr('y', ((-lines.length * fontSize) / 4 + i * fontSize + fontSize / 2))
              .text(line);
          });
        });

      // Update + merge
      u.merge(gEnter)
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Exit
      u.exit().remove();
    }

    // Drag handlers
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
      select(event.sourceEvent.target.parentNode).style('cursor', 'grabbing');
    }
    function dragged(event, d) {
      d.fx = event.x; d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0);
      if (cloudMode !== 'static') {
        d.fx = null; d.fy = null;
      }
      select(event.sourceEvent.target.parentNode).style('cursor', 'pointer');
    }

    return () => sim.stop();
  }, [notes, dim.width, dim.height]);

  // 3) Update forces when cloudMode changes
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;

    // Update center force only for clustered mode
    if (cloudMode === 'clustered') {
      sim.force('center', d3Force.forceCenter(dim.width / 2, dim.height / 2));
    } else {
      sim.force('center', null); // disable center force for other modes
    }

    // 2) update charge & decay
    sim.force('charge', d3Force.forceManyBody().strength(getChargeStrength(cloudMode)))
      .alphaDecay(getAlphaDecay(cloudMode));

    sim.alpha(0.5).restart();

    if (cloudMode === 'static') {
      setTimeout(() => sim.stop(), 1000);
    }
  }, [cloudMode]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg ref={svgRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
