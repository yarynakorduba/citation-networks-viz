import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { slice, pathOr, keys, compose, map, prop, values, mapObjIndexed } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';
import { useDnD, useLoadData } from '../../hooks/graph';

import './Graph.scss';

const WIDTH = 1000;
const HEIGHT = 1000;
const COLOR_RANGE = ['#CCCCCC', 'blue'];
const NODE_COLOR_RANGE = ['#ff4a4a', '#ad0303'];

// citation graph-related
const getAuthorNodeRadius = (d) => Math.sqrt((5 * d.papersCount) / Math.PI);
const getCiteCollisionRadius = (d) =>
  getAuthorNodeRadius(d) > 4 ? getAuthorNodeRadius(d) * 10 : getAuthorNodeRadius(d);

function Graph() {
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const [data, setData] = useLoadData('authData.json');
  const authorshipDomain = useMemo(
    () => d3.extent(values(pathOr({}, ['coauthorships'], data)), (d) => (d.papers || []).length),
    [data],
  );
  const papersCountDomain = useMemo(
    () => d3.extent(values(pathOr({}, ['authors'], data)), (d) => d.papersCount),
    [data],
  );

  const svg = d3.select('svg#coauthorshipGraph');

  const simulationRef = useRef(null);
  const { dragstarted, dragged, dragended } = useDnD();

  const testClick = () => {
    setData(slice(1, data.length - 20, data));
  };

  const [selectedNode, setSelectedNode] = useState(null);
  const handleSelectNode = (ev, d) => {
    console.log('==d=> ', d);
    setSelectedNode(d);
  };

  const computeNodesAndLinks = useCallback(async () => {
    if (data && keys(data).length) {
      const nodes = compose(
        (d) => d,
        (d) => values(d),
        mapObjIndexed((author, id) => ({
          ...author,
          id,
        })),
      )(data.authors);

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
    .style('fill', (d) => getColorScale(papersCountDomain, NODE_COLOR_RANGE)(d.papersCount))
    .on('click', (ev, d) => console.log(d))
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
      .force('charge', d3.forceManyBody().distanceMin(3).distanceMax(50).strength(-20))
      .force(
        'center',
        d3
          .forceCenter()
          .x(WIDTH / 2)
          .y(HEIGHT / 2),
      )
      .force(
        'link',
        d3
          .forceLink()
          .id(prop('id'))
          .distance((d) =>
            d.source.papersCount + d.target.papersCount <= 4
              ? 3
              : d3.scaleLinear(authorshipDomain, [4, 50])(d.source.papersCount + d.target.papersCount),
          )
          .strength(0.25),
      )
      .force('collision', d3.forceCollide(getCiteCollisionRadius).strength(0.25));

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements, WIDTH, HEIGHT));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, nodeElements, linkElements]);

  return (
    <div>
      <button onClick={testClick}>Test</button>
      <svg
        id="coauthorshipGraph"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${-WIDTH} ${-HEIGHT}`}
      />
      <div>{}</div>
    </div>
  );
}

export default Graph;
