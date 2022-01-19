import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { reduce, indexBy, filter, compose, map, prop } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';
import { useArrowMarker } from '../../hooks/graph';

import './Graph.scss';

const WIDTH = 800;
const HEIGHT = 600;
const COLOR_RANGE = ['#ff4a4a', '#ad0303'];
const ARROW_MARKER_ID = 'arrowhead';

// citation graph-related
const getCiteNodeRadius = (d) => Math.sqrt((10 + 100 * d.citedBy) / Math.PI);
const getCiteCollisionRadius = (d) => getCiteNodeRadius(d) + 5;

function Graph({ data, setSelectedNode }) {
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const citedByDomain = useMemo(() => d3.extent(data, (d) => d.citedBy), [data]);

  const svg = d3.select('svg#citationGraph');
  useArrowMarker(ARROW_MARKER_ID);

  const simulationRef = useRef(null);

  const computeNodesAndLinks = useCallback(async () => {
    if (data) {
      const nodes = data;
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
    .attr('id', (d) => d.id)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 3)
    .attr('cursor', 'pointer')
    .style('fill', (d) => getColorScale(citedByDomain, COLOR_RANGE)(d.citedBy))
    .on('click', (ev, d) => {
      const { authors, citedBy, keywords, title, id, year } = d;
      const authorNames = authors.map((author) => `${author.forename}. ${author.surname}`);
      setSelectedNode({
        authorNames,
        citedBy,
        keywords,
        title,
        id,
        year,
      });
    });

  useEffect(() => {
    simulationRef.current = d3
      .forceSimulation()
      .alphaDecay(0.03)
      .force('charge', d3.forceManyBody().strength(0))
      .force(
        'center',
        d3
          .forceCenter()
          .x(WIDTH / 2)
          .y(HEIGHT / 2),
      )
      .force('link', d3.forceLink().id(prop('id')))
      .force('collision', d3.forceCollide(getCiteCollisionRadius));

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements, WIDTH, HEIGHT));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, nodeElements, linkElements]);

  useEffect(() => {
    const simulationStop = setTimeout(() => simulationRef.current.stop(), 5000);
    return () => clearTimeout(simulationStop);
  }, []);

  return (
    <svg
      id="citationGraph"
      class="citation-graph"
      width={WIDTH}
      height={HEIGHT}
      viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${-WIDTH} ${-HEIGHT}`}
    />
  );
}

export default memo(Graph);
