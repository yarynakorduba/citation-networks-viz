import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { reduce, slice, indexBy, filter, compose, map, prop } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';
import { useDnD, useLoadData, useArrowMarker } from '../../hooks/graph';

import './Graph.scss';

const WIDTH = 1000;
const HEIGHT = 500;
const COLOR_RANGE = ['#ff4a4a', '#ad0303'];
const ARROW_MARKER_ID = 'arrowhead';

// citation graph-related
const getCiteNodeRadius = (d) => Math.sqrt((10 + 100 * d.citedBy) / Math.PI);
const getCiteCollisionRadius = (d) => getCiteNodeRadius(d) + 5;

function Graph() {
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const [data, setData] = useLoadData('citeData.json');
  const citedByDomain = useMemo(() => d3.extent(data, (d) => d.citedBy), [data]);

  const svg = d3.select('svg');
  useArrowMarker(ARROW_MARKER_ID);

  const simulationRef = useRef(null);
  const { dragstarted, dragged, dragended } = useDnD();

  const testClick = () => {
    setData(slice(1, data.length - 20, data));
  };

  const computeNodesAndLinks = useCallback(async () => {
    if (data) {
      const nodes = d3.map(data, ({ title, ...paper }, index) => ({
        ...paper,
        id: title,
        order: index,
      }));
      const nodeIdsObj = indexBy(prop('id'), nodes);
      const links = reduce(
        (accum, { title, citations }) => {
          const paperLinks = compose(
            map((citation) => ({
              source: title,
              target: citation.title,
            })),
            filter((p) => nodeIdsObj[p.title]),
          )(citations);
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
    computeNodesAndLinks();
  }, [computeNodesAndLinks]);

  const linkElements = svg
    .selectAll('line')
    .data(links)
    .join(...getD3ElementLifecycle('line'))
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('marker-end', () => `url(#${ARROW_MARKER_ID})`)
    .lower();

  const nodeElements = svg
    .selectAll('circle')
    .data(nodes)
    .join(...getD3ElementLifecycle('circle'))
    .attr('r', getCiteNodeRadius)
    .style('fill', (d) => getColorScale(citedByDomain, COLOR_RANGE)(d.citedBy))
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
      .force('link', d3.forceLink().id(prop('id')))
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
