import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import CarDetail from './pages/CarDetail.jsx';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070711]">
        <Header />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/car/:id" element={<CarDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
