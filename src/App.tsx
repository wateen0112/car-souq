import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import Home from './pages/Home';
import FilterPage from './pages/Filter';
import CarDetails from './pages/CarDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCarForm from './pages/AdminCarForm';
import AdminCarouselAds from './pages/AdminCarouselAds';
import { api } from '../api';


function App() {
  const [showDialog, setShowDialog] = useState(false);
  const { userId } = useParams()
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.getUser();
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !localStorage.getItem('homeScreenPromptShown')) {
      setShowDialog(true);
      localStorage.setItem('homeScreenPromptShown', 'true');
    }
  }, []);


  const closeDialog = () => setShowDialog(false);

  return (
    <Provider store={store}>
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
            <Route path="/:userId/" element={<Home />} />
            <Route path="/:userId/filter" element={<FilterPage />} />
            <Route path="/:userId/car/:id" element={<CarDetails />} />
            <Route path="/:userId/admin/login" element={<AdminLogin />} />
            <Route path="/:userId/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/:userId/admin/carousel" element={<AdminCarouselAds />} />
            <Route path="/:userId/admin/cars/new" element={<AdminCarForm />} />
            <Route path="/:userId/admin/cars/edit/:id" element={<AdminCarForm />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
