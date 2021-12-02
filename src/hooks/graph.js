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
