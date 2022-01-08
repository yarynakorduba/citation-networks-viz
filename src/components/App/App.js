import CitationGraph from '../Graph/CitationGraph';
import CoauthorshipGraph from '../Graph/CoauthorshipGraph';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../../views/Home';
import Navbar from '../../components/Navbar';
import './App.scss';

function App() {
  return (
    <>
      <Navbar />
      <main className="app">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/citation" element={<CitationGraph />} />
            <Route path="/coauthorship" element={<CoauthorshipGraph />} />
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
}

export default App;
