import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import FilterPage from './pages/Filter';
import CarDetails from './pages/CarDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCarForm from './pages/AdminCarForm';
import AdminCarouselAds from './pages/AdminCarouselAds';

function App() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !localStorage.getItem('homeScreenPromptShown')) {
      setShowDialog(true);
      localStorage.setItem('homeScreenPromptShown', 'true');
    }
  }, []);

  const closeDialog = () => setShowDialog(false);

  return (
    <>
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-4">إضافة إلى الشاشة الرئيسية</h2>
            <p className="mb-4">للحصول على أفضل تجربة، أضف هذا التطبيق إلى شاشتك الرئيسية.</p>
            <button
              onClick={closeDialog}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              موافق
            </button>
          </div>
        </div>
      )}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/filter" element={<FilterPage />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/carousel" element={<AdminCarouselAds />} />
            <Route path="/admin/cars/new" element={<AdminCarForm />} />
            <Route path="/admin/cars/edit/:id" element={<AdminCarForm />} />
          </Routes>
        </Layout>
      </Router>
    </>
  );
}

export default App;
