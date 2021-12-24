import CitationGraph from '../Graph/CitationGraph';
import CoauthorshipGraph from '../Graph/CoauthorshipGraph';

import './App.scss';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Publications Viz</h1>
        <CitationGraph />
        <CoauthorshipGraph />
      </header>
    </div>
  );
}

export default App;
