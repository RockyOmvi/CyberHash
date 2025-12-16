import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../services/api';

export function NetworkGraph() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }, []);

    const [data, setData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real data from the backend APM endpoint
                const graphData = await api.getAPMGraph();
                setData(graphData);
            } catch (error) {
                console.error("Failed to fetch network graph:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[300px]">
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeLabel="id"
                nodeColor={node => {
                    const colors = ['#ffffff', '#22d3ee', '#34d399', '#f472b6', '#a78bfa', '#fbbf24'];
                    return colors[(node as any).group] || '#ffffff';
                }}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                backgroundColor="rgba(0,0,0,0)"
                nodeRelSize={6}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={() => 0.005}
            />
        </div>
    );
}
