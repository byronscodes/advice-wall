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
                const boxWidth = 30;
                const boxHeight = 30;

                const x = node.x - boxWidth / 2;
                const y = node.y - boxHeight / 2;

                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, boxWidth, boxHeight);

                ctx.fillStyle = 'black';
                ctx.font = `${19 / globalScale}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.justifyContent = 'center';
                ctx.fillText(node.content.slice(0, 20), node.x, node.y);

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 0.25;
                ctx.strokeRect(x, y, boxWidth, boxHeight);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                // Define clickable/hover area
                const boxWidth = 30;
                const boxHeight = 30;

                const x = node.x - boxWidth / 2;
                const y = node.y - boxHeight / 2;

                ctx.fillStyle = color;
                ctx.fillRect(x, y, boxWidth, boxHeight);
            }}
            onNodeClick={(node) => {
                setSelectedNote(node);
            }}
            width={window.innerWidth - 4}
            height={window.innerHeight}
        />
    );
}
