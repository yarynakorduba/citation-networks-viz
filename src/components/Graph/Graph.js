import { useState, useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { reduce, slice, indexBy, filter, compose, map, prop } from 'ramda';

import { getCiteNodeRadius, getCiteCollisionRadius, ticked } from '../../helpers/graph';
import { useDnD } from '../../hooks/graph';

import './Graph.scss';

const WIDTH = 1000;
const HEIGHT = 500;

function Graph() {
  const [data, setData] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const simulationRef = useRef(null);
  const { dragstarted, dragged, dragended } = useDnD();

  const testClick = () => {
    setData(slice(1, data.length - 20, data));
  };

  const loadData = useCallback(async () => {
    const loadedData = await d3.json('data.json', (e, d) => {});
    setData(loadedData);
  }, [setData]);

  const computeNodesAndLinks = useCallback(async () => {
    if (data) {
      const nodes = d3.map(data, (paper, index) => ({
        ...paper,
        id: paper.title,
        order: index,
      }));
      const nodeIdsObj = indexBy(prop('id'), nodes);
      const links = reduce(
        (accum, paper) => {
          const paperLinks = compose(
            map((citation) => ({
              source: paper.title,
              target: citation.title,
            })),
            filter(({ title }) => nodeIdsObj[title]),
          )(paper.citations);
          return [...accum, ...paperLinks];
        },
        [],
        data,
      );

      setNodes(nodes);
      setLinks(links);
    }
  }, [setNodes, setLinks, data]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  useEffect(() => {
    computeNodesAndLinks();
  }, [computeNodesAndLinks]);

  const svg = d3.select('svg');
  const linkElements = svg
    .selectAll('line')
    .data(links)
    .join(
      (enter) => enter.append('line'),
      (update) => update,
      (exit) => exit.remove(),
    )
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .lower();

  const nodeElements = svg
    .selectAll('circle')
    .data(nodes)
    .join(
      (enter) => enter.append('circle'),
      (update) => update,
      (exit) => exit.remove(),
    )
    .attr('r', getCiteNodeRadius)
    .style('fill', 'red')
    .attr('stroke', 'red')
    .attr('stroke-width', 1.5)
    .call(
      d3
        .drag()
        .on('start', (ev, d) => dragstarted(simulationRef.current)(ev, d))
        .on('drag', (ev, d) => dragged(simulationRef.current)(ev, d))
        .on('end', (ev, d) => dragended(simulationRef.current)(ev, d)),
    );

  useEffect(() => {
    simulationRef.current = d3
      .forceSimulation()
      .force('charge', d3.forceManyBody().strength(0))
      .force('center', d3.forceCenter().strength(0.01))
      .force(
        'link',
        d3.forceLink().id((d) => d.id),
      )
      .force('collision', d3.forceCollide(getCiteCollisionRadius));

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, nodeElements, linkElements]);

  return (
    <div>
      <button onClick={testClick}>Test</button>
      <svg width={WIDTH} height={HEIGHT} viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`} />
    </div>
  );
}

export default Graph;
