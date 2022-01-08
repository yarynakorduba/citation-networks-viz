import NavCard from '../components/NavCard';

function Home() {
  return (
    <div className="card-container">
      <NavCard
        title="Citation graph"
        subtitle="Graph displaying number of citations"
        bannerImage="citationGraphBanner.png"
        to="/citation"
      />
      <NavCard
        title="Co-authorship graph"
        subtitle="Graph display number of coauthorships"
        bannerImage="coAuthorshipGraphBanner.png"
        to="/coauthorship"
      />
    </div>
  );
}

export default Home;
