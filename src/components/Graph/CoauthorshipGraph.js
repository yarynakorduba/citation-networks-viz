import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { pathOr, keys, compose, map, prop, values, mapObjIndexed, sort } from 'ramda';

import { ticked, getColorScale, getD3ElementLifecycle } from '../../helpers/graph';

import './Graph.scss';

const WIDTH = 800;
const HEIGHT = 700;
const COLOR_RANGE = ['#CCCCCC', 'blue'];
const NODE_COLOR_RANGE = ['#ff4a4a', '#ad0303'];
const NODE_SIZE_RANGE = [2.5, 12];
const STROKE_SIZE_RANGE = [1, 8];

const radialPositionScale = (domain, range = [600, 240, 120, 30, 1]) => {
  const [min, max] = domain;
  const tQuarter = (max - min) / 4;
  const thresholds = [min, min + tQuarter, min + 2 * tQuarter, min + 3 * tQuarter, max];
  return d3.scaleThreshold().range(range).domain(thresholds);
};

// citation graph-related
const getAuthorNodeRadius = (domain, range) => (d) => d3.scaleLinear().domain(domain).range(range)(d);
const getCiteCollisionRadius = (domain, range) => (d) =>
  getAuthorNodeRadius(domain, range)(d) >= 4
    ? getAuthorNodeRadius(domain, range)(d) * 5
    : getAuthorNodeRadius(domain, range)(d) * 2.5;

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
        sort((a, b) => (b.papers || []).length - (a.papers || []).length),
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
    .attr('stroke-width', (d) => d3.scaleLinear(authorshipDomain, STROKE_SIZE_RANGE)((d.papers || []).length))
    .lower();

  const nodeElements = svg
    .selectAll('circle')
    .data(nodes)
    .join(...getD3ElementLifecycle('circle'))
    .attr('r', (d) => getAuthorNodeRadius(papersCountDomain, NODE_SIZE_RANGE)(d.papersCount))
    .attr('id', (d) => d.id)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 3)
    .attr('cursor', 'pointer')
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
      .alphaDecay(0.015)
      .force(
        'charge',
        d3
          .forceManyBody()
          .distanceMin(20)
          .distanceMax(200)
          .strength((d) => (d.papersCount >= 4 ? -10 : -40)),
      )
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
          .distance((d) => d3.scaleLinear(authorshipDomain, [20, 70])(d.papers.length))
          .strength(0.35),
      )
      .force(
        'collision',
        d3.forceCollide((d) => getCiteCollisionRadius(papersCountDomain, NODE_SIZE_RANGE)(d.papersCount)).strength(0.5),
      )
      .force(
        'r',
        d3
          .forceRadial((d) => radialPositionScale(papersCountDomain)(d.papersCount))
          .x(WIDTH / 2)
          .y(HEIGHT / 2)
          .strength(0.8),
      );

    simulationRef.current.nodes(nodes).on('tick', ticked(nodeElements, linkElements, WIDTH, HEIGHT));
    simulationRef.current.force('link').links(links);
  }, [nodes, links, svg, authorshipDomain, papersCountDomain, setSelectedNode, nodeElements, linkElements]);

  return (
    <>
      <div className="legend">
        <div className="legend-description legend-node-description">
          <span className="legend-color legend-node-color">
            <span className="legend-min">{papersCountDomain[0]}</span>
            <span className="legend-max">{papersCountDomain[1]}</span>
          </span>
          Number of authored papers
        </div>
        <div className="legend-description legend-node-size">
          <small>Paper count is also encoded by the node size</small>
        </div>
        <div className="legend-description legend-link-description">
          <span className="legend-color legend-link-color"></span>
          Number of co-authored papers between two authors
        </div>
        <div className="legend-description legend-link-size">
          <small>Co-authored papers count is also encoded by the link width</small>
        </div>
      </div>
      <svg
        className="coauthorship-graph"
        id="coauthorshipGraph"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${-WIDTH} ${-HEIGHT}`}
      />
    </>
  );
}

export default memo(Graph);
