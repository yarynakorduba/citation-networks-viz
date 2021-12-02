import * as d3 from 'd3';
import { reduce } from 'ramda';
import { useEffect, useState, useCallback } from 'react';

import './App.scss';

const WIDTH = 1000;
const HEIGHT = 500;

function App() {
    const [data, setData] = useState(undefined);
    const [links, setLinks] = useState([]);
    const [nodes, setNodes] = useState([]);

    const loadData = useCallback(async () => {
        const loadedData = await d3.json('data.json', (e, d) => {
            console.log('===d', e, d);
        });
        setData(loadedData);
        const nodes = d3.map(loadedData, (paper, index) => ({
            ...paper,
            id: paper.title,
            order: index,
        }));

        const links = reduce(
            (accum, paper) => {
                const paperLinks = d3.map(
                    paper.citations,
                    (citation, index) => ({
                        source: paper.title,
                        target: citation.title,
                        id: accum.length + index,
                    }),
                );
                return [...accum, ...paperLinks];
            },
            [],
            loadedData,
        );

        console.log('----LINKS -- > ', links);

        setNodes(nodes);
        setLinks(links);
    }, [setData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getNodeRadius = (d) => Math.sqrt((5 + 100 * d.citedBy) / Math.PI);
    const getCollisionRadius = (d) => getNodeRadius(d) + 5;

    const simulation = d3
        .forceSimulation()
        .force('charge', d3.forceManyBody().strength(0))
        .force('center', d3.forceCenter().strength(0.01))
        .force(
            'link',
            d3.forceLink().id(function (d) {
                return d.id;
            }),
        )
        .force('collision', d3.forceCollide(getCollisionRadius));

    const dragstarted = (d) => {
        simulation.restart();
        simulation.alpha(0.7);
        d.fx = d.x;
        d.fy = d.y;
    };

    const dragged = (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
    };

    const dragended = (d) => {
        d.fx = null;
        d.fy = null;
        simulation.alphaTarget(0.5);
    };

    const svg = d3.select('svg');

    const link = svg
        .selectAll('line')
        .data(links)
        .join(
            (enter) => enter.append('line'),
            (update) => update,
            (exit) => exit.remove(),
        )
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);

    const node = svg
        .selectAll('circle')
        .data(nodes)
        .join(
            (enter) => enter.append('circle'),
            (update) => update,
            (exit) => exit.remove(),
        )
        .attr('r', getNodeRadius)
        .style('fill', 'red')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .call(
            d3
                .drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended),
        );

    const ticked = () => {
        link.attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

        node.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    };

    simulation.on('tick', ticked);

    simulation.nodes(nodes).on('tick', ticked);

    simulation.force('link').links(links);

    return (
        <div className="App">
            <header>
                <h1>Publications Viz</h1>
                <svg
                    width={WIDTH}
                    height={HEIGHT}
                    viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
                />
            </header>
        </div>
    );
}

export default App;
