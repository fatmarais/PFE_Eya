import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const Map = () => {
  const [data, setData] = useState({ nodes: [], links: [] });

  const apiKey = "ceC9njcd5aFqemuJ9sdVAUBu6KXI9gYWYAWYNimDoOAQVF8DCB3eBnuc0rucrS4I";
  const apiUrl = `https://192.168.1.163/nagiosxi/api/v1/objects/hoststatus?apikey=${apiKey}`;

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(json => {
        const nodes = [{ id: "Nagios Process", main: true, status: "UP" }];
        const links = [];

        json.hoststatus.forEach(host => {
          const status =
            parseInt(host.current_state) === 0 ? "UP" :
            parseInt(host.current_state) === 1 ? "DOWN" :
            parseInt(host.current_state) === 2 ? "UNREACHABLE" : "UNKNOWN";

          nodes.push({
            id: host.address,
            label: host.name,
            status
          });

          links.push({ source: "Nagios Process", target: host.address });
        });

        setData({ nodes, links });
      })
      .catch(err => console.error("Error fetching host status:", err));
  }, []);

  const getColor = status => {
    switch (status) {
      case "UP": return "limegreen";
      case "DOWN": return "red";
      case "UNREACHABLE": return "orange";
      default: return "gray";
    }
  };

  return (
    <div style={{ height: "90vh", background: "#f0f4f8", borderRadius: "12px", boxShadow: "0 0 10px #ccc" }}>
      <h2 style={{ textAlign: "center", paddingTop: "10px", color: "#333" }}>
        Carte d'état du réseau
      </h2>
      <ForceGraph2D
        graphData={data}
        nodeLabel="label"
        nodeAutoColorBy="status"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || node.id;
          const fontSize = 12 / globalScale;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
          ctx.fillStyle = getColor(node.status);
          ctx.fill();
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#000";
          ctx.fillText(label, node.x, node.y + 12);
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.005}
      />
    </div>
  );
};

export default Map;
