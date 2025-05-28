import { set } from 'firebase/database';
import React, { useRef, useState, useEffect } from 'react';
// import ForceGraph2D from 'react-force-graph-2d';
import fromKapsule from 'react-kapsule';
import ForceGraph2DImpl from 'force-graph';
const ForceGraph2D = fromKapsule(
    ForceGraph2DImpl,
    undefined,
    ['d3Force', 'd3AlphaDecay', 'd3ReheatSimulation', 'pauseAnimation', 'centerAt', 'zoom']  // bind methods
);

export default function NoteCloud({ notes, cloudMode, setSelectedNote }) {
    const containerRef = useRef();
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

    useEffect(() => {
        function updateSize() {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        }

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const graph = graphRef.current;
        if (!graph) return;

        // Apply a custom bounding box constraint
        const maxRange = 300; // limit X and Y within -300 to 300

        graph.d3Force?.('constrain', () => {
            return (alpha) => {
                graph.graphData().nodes.forEach(node => {
                    node.x = Math.max(-maxRange, Math.min(maxRange, node.x || 0));
                    node.y = Math.max(-maxRange, Math.min(maxRange, node.y || 0));
                });
            };
        });

        graph.d3ReheatSimulation?.(); // restart with new force
    }, [notes]);

    // Convert notes to graph data
    const graphData = {
        nodes: notes.map((note) => ({
            id: note.id,
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
                graph.d3Force?.('charge').strength(-15);
                graph.d3Force?.('center', null); // strong center clustering
                break;

            case 'static':
                graph.d3AlphaDecay(0.8);
                graph.d3Force?.('charge').strength(0);
                setTimeout(() => graph.pauseAnimation(), 2000);
                break;

            case 'floating':
                graph.d3AlphaDecay(0.03);
                graph.d3Force?.('charge').strength(-5);
                break;

            default:
                break;
        }
    }, [cloudMode]);

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }

    function limitText(text, boxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';

        for (let i = 0; i < words.length; i++) {
            line += words[i];
            if (words[i].length > boxWidth / 3) {
                const len = boxWidth / 5;
                return line.substring(0, len) + '...';
            }
            else if (line.length > 30) {
                return line + '...';
            }
            line += ' ';
        }
        return line;
    }

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeColor={"white"}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const boxWidth = 60;
                    const boxHeight = 60;
                    let text = node.title ? limitText(node.title, boxWidth) : limitText(node.content, boxWidth);

                    const x = node.x - boxWidth / 2;
                    const y = node.y - boxHeight / 2;

                    ctx.fillStyle = 'white';
                    ctx.fillRect(x, y, boxWidth, boxHeight);

                    ctx.fillStyle = 'black';
                    const fontSize = boxWidth / 9;
                    ctx.font = node.title ? `bold ${fontSize}px Inter, sans-serif` : `${fontSize}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.justifyContent = 'center';
                    const padding = 5;

                    const lines = wrapText(ctx, text, boxWidth - padding * 2);
                    ctx.textBaseline = 'middle';
                    const totalHeight = lines.length * fontSize;
                    lines.forEach((line, i) => {
                        ctx.fillText(
                            line,
                            node.x,
                            node.y - totalHeight / 2 + i * fontSize + fontSize / 2)
                            ;
                    });

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
                width={window.innerWidth}
                height={window.innerHeight}
            />
        </div>
    );
}
