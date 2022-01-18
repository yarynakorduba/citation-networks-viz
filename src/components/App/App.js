import { HashRouter, Route, Routes } from 'react-router-dom';
import CitationPage from '../DataVizPage/CitationPage';
import CoauthorshipPage from '../DataVizPage/CoauthorshipPage';
import Home from '../../views/Home';
import Navbar from '../../components/Navbar';
import './App.scss';

function App() {
  return (
    <>
      <main className="app">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/citation/" element={<CitationPage />} />
            <Route path="/coauthorship/" element={<CoauthorshipPage />} />
          </Routes>
        </HashRouter>
      </main>
      <Navbar />
    </>
  );
}

export default App;
