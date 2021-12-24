import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { slice, pathOr, keys, compose, map, prop, values, mapObjIndexed } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';
import { useDnD, useLoadData } from '../../hooks/graph';

import './Graph.scss';

const WIDTH = 1000;
const HEIGHT = 1000;
const COLOR_RANGE = ['#d77474', 'blue'];

// citation graph-related
const getAuthorNodeRadius = (d) => 4; // Math.sqrt((10 + 100 * d.citedBy) / Math.PI);
const getCiteCollisionRadius = (d) => getAuthorNodeRadius(d);

function Graph() {
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const [data, setData] = useLoadData('authorData.json');
  //   console.log('===AAAA>>> ', values(pathOr({}, ['coauthorships'], data)));
  const authorshipDomain = useMemo(
    () => d3.extent(values(pathOr({}, ['coauthorships'], data)), (d) => (d.papers || []).length),
    [data],
  );
  console.log('--->>> ', authorshipDomain);
  const svg = d3.select('svg#coauthorshipGraph');

  const simulationRef = useRef(null);
  const { dragstarted, dragged, dragended } = useDnD();

  const testClick = () => {
    setData(slice(1, data.length - 20, data));
  };

  const computeNodesAndLinks = useCallback(async () => {
    if (data && keys(data).length) {
      const nodes = compose(
        (d) => console.log('>>> ', d) || d,
        (d) => values(d),
        mapObjIndexed((author, id) => ({
          ...author,
          id,
        })),
      )(data.authors);

      console.log('nodes', nodes);

      const links = compose(
        map((d) => ({
          ...d,
          source: d.firstAuthor,
          target: d.secondAuthor,
        })),
        (d) => values(d),
      )(data.coauthorships);

      console.log('-', nodes);
      setNodes(nodes);
      setLinks(links);
    }
  }, [setNodes, setLinks, data]);

  useEffect(() => {
    computeNodesAndLinks();
  }, [computeNodesAndLinks]);

  console.log('===links ', links);
  const linkElements = svg
    .selectAll('line')
    .data(links)
    .join(...getD3ElementLifecycle('line'))
    .style('stroke', (d) => getColorScale(authorshipDomain, COLOR_RANGE)((d.papers || []).length))
    .attr('stroke-width', (d) => d3.scaleLog(authorshipDomain, [1, 8])((d.papers || []).length))
    .lower();

  const nodeElements = svg
    .selectAll('circle')
    .data(nodes)
    .join(...getD3ElementLifecycle('circle'))
    .attr('r', getAuthorNodeRadius)
    .style('stroke', 'red')
    // .style('fill', (d) => getColorScale(authorshipDomain, COLOR_RANGE)(d.citedBy))
    .on('click', (d) => console.log(d.target))
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
      .alphaDecay(0.01)
      .force('charge', d3.forceManyBody().distanceMin(15).distanceMax(100).strength(-20))
      .force('center', d3.forceCenter())
      .force(
        'link',
        d3
          .forceLink()
          .id(prop('id'))
          .distance((d) => d3.scaleLog(authorshipDomain, [25, 45])((d.papers || []).length))
          .strength(0.2),
      )
      .force('collision', d3.forceCollide(getCiteCollisionRadius).strength(1));
    //   .alpha(0.5);

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, nodeElements, linkElements]);

  return (
    <div>
      <button onClick={testClick}>Test</button>
      <svg
        id="coauthorshipGraph"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
      />
    </div>
  );
}

export default Graph;
