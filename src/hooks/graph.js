import { useCallback, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { toLower } from 'ramda';
import { useDebounce } from 'use-debounce';

export const useLoadData = (fileName) => {
  const [data, setData] = useState([]);

  const loadData = useCallback(async () => {
    const loadedData = await d3.json(fileName);
    setData(loadedData);
  }, [fileName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return [data, setData];
};

export const useDnD = () => {
  const dragstarted = (simulation) => (d) => {
    simulation.restart();
    simulation.alpha(0.7);
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = () => (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (simulation) => (d) => {
    d.fx = null;
    d.fy = null;
    simulation.alphaTarget(0.5);
  };
  return { dragstarted, dragged, dragended };
};

export const useArrowMarker = (markerId) => {
  useEffect(() => {
    d3.select('svg')
      .append('defs')
      .append('marker')
      .attr('id', markerId)
      .attr('refX', 9.5)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .attr('markerWidth', 12)
      .attr('markerHeight', 9)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M1.25 1.08359L7.33542 3L1.25 4.91641L1.25 1.08359Z')
      .attr('fill', '#999')
      .style('stroke', 'none');
  }, [markerId]);
};

export const useSearchWithNodeHighlighting = (data, searcher) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput] = useDebounce(searchInput, 400);
  const [highlighted, setHighlighted] = useState([]);
  const lowerSearchInput = useMemo(() => toLower(debouncedSearchInput), [debouncedSearchInput]);

  useEffect(() => {
    if (debouncedSearchInput) {
      const newHighlighted = data.map(searcher(lowerSearchInput));
      setHighlighted(newHighlighted);
    } else {
      setHighlighted(data);
    }
  }, [data, lowerSearchInput, debouncedSearchInput, setHighlighted, searcher]);

  useEffect(() => {
    highlighted &&
      highlighted.map(({ id, isHighlighted }) => {
        const element = document.getElementById(id);
        element && element.setAttribute('stroke', isHighlighted ? '#161853b8' : 'none');
      });
  }, [highlighted]);

  return {
    searchInput,
    setSearchInput,
  };
};
