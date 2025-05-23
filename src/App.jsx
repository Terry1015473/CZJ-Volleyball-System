import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AnalysisPage from './AnalysisPage';
import MainApp from './MainApp'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
