import * as d3 from 'd3';
import { flatten, reduce } from 'ramda';
import { useEffect, useState, useCallback } from 'react';

import './App.css';

const WIDTH = 1000;
const HEIGHT = 500;

function App() {
  const [data, setData] = useState(undefined);
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const loadData = useCallback(async () => {
    const loadedData = await d3.json('data.json', (e, d) => { console.log("===d", e, d) });
    setData(loadedData);
    const nodes = d3.map(loadedData, (paper, index) => ({
      ...paper,
      id: paper.title,
      order: index,
    }))

    const links = reduce((accum, paper) => {
      const paperLinks = d3.map(paper.citations, (citation, index) => ({
          source: paper.title,
          target: citation.title,
          index: accum.length + index
        }));
      return [...accum, ...paperLinks]
    }, [], loadedData)

    console.log("----LINKS -- > ", links)

    setNodes(nodes);
    setLinks(links)
  }, [setData]);

  useEffect(() => {
    loadData()
  }, [loadData]);

  const node = d3.select('svg')
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 7)
      .style("fill", "#69b3a2")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)

  const link = d3.select('svg')
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
  
  // const links = d3.select()

  const ticked = () => {
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
  }

   const simulation  = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(link).id(({index: i}) => i+10))
        .force("center", d3.forceCenter().strength(0.01))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked)

  console.log("====setData -- > ", data)

  return (
    <div className="App">
      <header>
        <h1>Publications Viz</h1>
        <svg width={WIDTH} height={HEIGHT} viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`} />
      </header>
    </div>
  );
}

export default App;
