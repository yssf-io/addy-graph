import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

const shortenEthereumAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address)
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : (() => {
        throw new Error("Invalid Ethereum address");
      })();

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  value: string;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

function drawGraph(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: GraphData
) {
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"])
    .enter()
    .append("marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 26)
    .attr("refY", 0)
    .attr("markerWidth", 18)
    .attr("markerHeight", 18)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#888");

  const width = 800;
  const height = 600;

  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink(data.links)
        .id(
          (
            d: d3.SimulationNodeDatum,
            i: number,
            nodesData: d3.SimulationNodeDatum[]
          ) => (d as Node).id
        ) as any
    )
    .force("charge", d3.forceManyBody().strength(-7000))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 1)
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke-width", (d) => 1)
    .attr("marker-end", "url(#end)")
    .text((d) => d.value);

  const drag = (simulation: d3.Simulation<Node, undefined>) => {
    function dragstarted(
      event: d3.D3DragEvent<Element, Node, Element>,
      d: Node
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<Element, Node, Element>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<Element, Node, Element>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag<SVGCircleElement, Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", 30)
    .style("fill", "#000")
    .call(drag(simulation) as any);

  const labels = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(data.nodes)
    .join("text")
    .text((d) => shortenEthereumAddress(d.id))
    .style("text-anchor", "middle")
    .style("fill", "#fff")
    .style("bg-color", "#fff")
    .style("font-family", "Arial")
    .style("font-size", 12);

  simulation.on("tick", () => {
    link
      .attr("x1", (d: Link) => (d.source as Node).x || 0)
      .attr("y1", (d: Link) => (d.source as Node).y || 0)
      .attr("x2", (d: Link) => (d.target as Node).x || 0)
      .attr("y2", (d: Link) => (d.target as Node).y || 0);

    node.attr("cx", (d: Node) => d.x || 0).attr("cy", (d: Node) => d.y || 0);

    labels.attr("x", (d: Node) => d.x || 0).attr("y", (d: Node) => d.y || 0);
  });
}

const TransactionsGraph: React.FC<{ data: GraphData }> = ({ data }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      const svg = d3
        .select(ref.current as SVGSVGElement)
        .attr("viewBox", `0 0 800 600`);

      drawGraph(svg, data);
    }
  }, [data]);

  return <svg ref={ref} />;
};

export default TransactionsGraph;
