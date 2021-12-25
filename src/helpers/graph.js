import * as d3 from 'd3';

const constrainPositionToBoundingBox =
  (element, coordinate) =>
  (boxWidth = 1000, boxHeight = 1000) => {
    const boundary = coordinate === 'x' ? boxWidth : boxHeight;
    return Math.max(20, Math.min(boundary - 20, element[coordinate]));
  };

export const ticked = (nodeElements, linkElements, width, height) => () => {
  linkElements
    .attr('x1', (d) => constrainPositionToBoundingBox(d.source, 'x')(width, height))
    .attr('y1', (d) => constrainPositionToBoundingBox(d.source, 'y')(width, height))
    .attr('x2', (d) => constrainPositionToBoundingBox(d.target, 'x')(width, height))
    .attr('y2', (d) => constrainPositionToBoundingBox(d.target, 'y')(width, height));

  nodeElements.attr('transform', function (d) {
    const x = constrainPositionToBoundingBox(d, 'x')(width, height);
    const y = constrainPositionToBoundingBox(d, 'y')(width, height);
    return 'translate(' + x + ',' + y + ')';
  });
};

export const getD3ElementLifecycle = (element) => [
  (enter) => enter.append(element),
  (update) => update,
  (exit) => exit.remove(),
];

export const getColorScale = (domain, colorRange) => d3.scaleLinear().domain(domain).range(colorRange);
