import { useEffect, useState, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { GitGraph, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface Node {
    id: string;
    label: string;
    type: string;
    color: string;
    x?: number;
    y?: number;
    z?: number;
}

interface Link {
    source: string;
    target: string;
    label: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

export function APMPage() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const fgRef = useRef<any>();

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const data = await api.getAPMGraph();
                // Transform metrics into graph nodes/links if data is array
                if (Array.isArray(data)) {
                    const nodes = data.map((m: any) => ({
                        id: m.id,
                        label: m.service,
                        type: 'service',
                        color: m.status === 'Healthy' ? '#10b981' : '#ef4444'
                    }));
                    // Create dummy links for visualization
                    const links = nodes.slice(1).map((n, i) => ({
                        source: nodes[i].id,
                        target: n.id,
                        label: 'connects'
                    }));
                    setGraphData({ nodes, links });
                } else {
                    setGraphData(data || { nodes: [], links: [] });
                }
            } catch (error) {
                console.error("Failed to fetch APM graph:", error);
                setGraphData({ nodes: [], links: [] });
            }
        };
        fetchGraph();
    }, []);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GitGraph className="text-red-500" />
                    Attack Path Management (APM)
                </h1>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                        <AlertTriangle size={14} className="text-red-400" />
                        <span className="text-xs text-red-300">Critical Path to Crown Jewels</span>
                    </div>
                </div>
            </div>

            <Card className="flex-1 min-h-[600px] relative overflow-hidden bg-black/40 border-white/10">
                <CardHeader className="absolute top-0 left-0 z-10 bg-black/50 backdrop-blur-sm w-full border-b border-white/5">
                    <CardTitle className="text-sm font-mono text-gray-400">
                        Visualizing Attack Vectors (Neo4j Graph)
                    </CardTitle>
                </CardHeader>
                <div className="h-full w-full">
                    {graphData.nodes.length > 0 && (
                        <ForceGraph3D
                            ref={fgRef}
                            graphData={graphData}
                            nodeLabel="label"
                            nodeColor="color"
                            nodeRelSize={6}
                            linkColor={() => 'rgba(255,255,255,0.2)'}
                            linkDirectionalArrowLength={3.5}
                            linkDirectionalArrowRelPos={1}
                            backgroundColor="rgba(0,0,0,0)"
                            onNodeClick={node => {
                                if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
                                    const distance = 40;
                                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                                    fgRef.current.cameraPosition(
                                        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                                        node,
                                        3000
                                    );
                                }
                            }}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}
