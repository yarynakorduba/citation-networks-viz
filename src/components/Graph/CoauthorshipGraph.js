import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { pathOr, keys, compose, map, prop, values, mapObjIndexed } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';

import './Graph.scss';

const WIDTH = 1000;
const HEIGHT = 800;
const COLOR_RANGE = ['#CCCCCC', 'blue'];
const NODE_COLOR_RANGE = ['#ff4a4a', '#ad0303'];

// citation graph-related
const getAuthorNodeRadius =
  (domain, range = [1, 7]) =>
  (d) =>
    d3.scaleLog().domain(domain).range(range)(d);
const getCiteCollisionRadius =
  (domain, range = [1, 7]) =>
  (d) =>
    getAuthorNodeRadius(domain, range)(d) > 4
      ? getAuthorNodeRadius(domain, range)(d) * 5
      : getAuthorNodeRadius(domain, range)(d);

function Graph({ data, setSelectedNode }) {
  const svg = d3.select('svg#coauthorshipGraph');

  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  const authorshipDomain = useMemo(
    () => d3.extent(values(pathOr({}, ['coauthorships'], data)), (d) => (d.papers || []).length),
    [data],
  );

  const papersCountDomain = useMemo(
    () => d3.extent(values(pathOr({}, ['authors'], data)), (d) => d.papersCount),
    [data],
  );

  const simulationRef = useRef(null);

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
    .attr('r', (d) => getAuthorNodeRadius(papersCountDomain, [2, 7])(d.papersCount))
    .attr('id', (d) => d.id)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 3)
    .style('fill', (d) => getColorScale(papersCountDomain, NODE_COLOR_RANGE)(d.papersCount))
    .on('click', (ev, d) => {
      const { forename, surname } = d;
      let { papers } = d;
      papers = papers.map((paper) => {
        const { authors, title } = paper;
        const authorNames = authors.map((author) => `${author.forename}. ${author.surname}`);
        return {
          authorNames,
          title,
        };
      });
      setSelectedNode({
        fullName: `${forename}. ${surname}`,
        papers,
      });
    });
  useEffect(() => {
    simulationRef.current = d3
      .forceSimulation()
      .alphaDecay(0.03)
      .force('charge', d3.forceManyBody().distanceMin(3).distanceMax(50).strength(-50))
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
          .strength(0.5),
      )
      .force(
        'collision',
        d3.forceCollide((d) => getCiteCollisionRadius(papersCountDomain, [2, 7])(d.papersCount)).strength(0.25),
      );

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements, WIDTH, HEIGHT));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, svg, authorshipDomain, papersCountDomain, setSelectedNode, nodeElements, linkElements]);

  return (
    <svg
      className="coauthorship-graph"
      id="coauthorshipGraph"
      width={WIDTH}
      height={HEIGHT}
      viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${-WIDTH} ${-HEIGHT}`}
    />
  );
}

export default memo(Graph);
