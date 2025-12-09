import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

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

    // Mock Data representing an attack surface
    const data = {
        nodes: [
            { id: 'Internet', group: 1, val: 20 },
            { id: 'Load Balancer', group: 2, val: 10 },
            { id: 'Web Server 1', group: 3, val: 5 },
            { id: 'Web Server 2', group: 3, val: 5 },
            { id: 'API Gateway', group: 2, val: 10 },
            { id: 'Auth Service', group: 4, val: 5 },
            { id: 'User DB', group: 5, val: 8 },
            { id: 'Payment Service', group: 4, val: 5 },
            { id: 'Payment DB', group: 5, val: 8 },
            { id: 'Admin Portal', group: 3, val: 5 },
        ],
        links: [
            { source: 'Internet', target: 'Load Balancer' },
            { source: 'Load Balancer', target: 'Web Server 1' },
            { source: 'Load Balancer', target: 'Web Server 2' },
            { source: 'Internet', target: 'API Gateway' },
            { source: 'API Gateway', target: 'Auth Service' },
            { source: 'Auth Service', target: 'User DB' },
            { source: 'API Gateway', target: 'Payment Service' },
            { source: 'Payment Service', target: 'Payment DB' },
            { source: 'Web Server 1', target: 'API Gateway' },
            { source: 'Web Server 2', target: 'API Gateway' },
            { source: 'Internet', target: 'Admin Portal' }, // Potential vulnerability
        ]
    };

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
