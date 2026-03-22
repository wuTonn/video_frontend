import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home.tsx';
import AnalysisPage from './pages/analysis.tsx';
import ReportPage from './pages/report.tsx';
import UploadPage from './pages/upload.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;