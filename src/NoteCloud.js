import { set } from 'firebase/database';
import React, { useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function NoteCloud({ notes, cloudMode, setSelectedNote }) {
    const graphRef = useRef();

    // Convert notes to graph data
    const graphData = {
        nodes: notes.map((note) => ({
            id: note.id,
            title: note.title,
            ...note
        })),
        links: [] // no links needed unless you want clustering
    };

    // Force behavior settings based on mode
    useEffect(() => {
        const graph = graphRef.current;

        if (!graph) return;

        switch (cloudMode) {
            case 'clustered':
                graph.d3AlphaDecay(0.02);
                graph.d3Force('charge').strength(-15);
                graph.d3Force('center', null); // strong center clustering
                break;

            case 'static':
                graph.d3AlphaDecay(0.8);
                graph.d3Force('charge').strength(0);
                setTimeout(() => graph.pauseAnimation(), 2000);
                break;

            case 'floating':
                graph.d3AlphaDecay(0.03);
                graph.d3Force('charge').strength(-5);
                break;

            default:
                break;
        }
    }, [cloudMode]);

    return (
        <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeColor={"white"}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const size = 60;
                ctx.save();
                ctx.translate(node.x, node.y);

                // Content preview
                ctx.fillStyle = 'white';
                ctx.fillRect(node.x - 30, node.y - 30, 30, 30);

                ctx.fillStyle = 'black';
                ctx.font = `${19 / globalScale}px Inter`;
                ctx.textAlign = 'center';
                ctx.justifyContent = 'center';
                ctx.fillText(node.content.slice(0, 20), 0, size / 2 + 12);

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 0.25;
                ctx.strokeRect(node.x - 30, node.y - 30, 30, 30);

                ctx.restore();
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                // Define clickable/hover area
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI, false);
                ctx.fill();
            }}
            onNodeClick={(node) => {
                setSelectedNote(node);
                console.log('Clicked note:', node);
            }}
            width={window.innerWidth - 100}
            height={window.innerHeight - 300}
        />
    );
}
