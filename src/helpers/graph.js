import * as d3 from 'd3';

export const ticked = (nodeElements, linkElements) => () => {
  linkElements
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);

  nodeElements.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
};

export const getColorScale = (domain, colorRange) => d3.scaleLinear().domain(domain).range(colorRange);
