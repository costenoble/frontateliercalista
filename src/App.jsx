import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Alterations from '@/pages/Alterations';
import ScrollToTop from '@/components/ScrollToTop';
import Success from '@/pages/Success';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import ConfirmationDepot from '@/pages/confirmation-depot';
import CGV from '@/pages/CGV';
import MentionsLegales from '@/pages/MentionsLegales';
import PolitiqueConfidentialite from '@/pages/PolitiqueConfidentialite';
import CartPage from '@/pages/CartPage';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { AlterationCartProvider } from '@/hooks/useAlterationCart';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        <AlterationCartProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <ScrollToTop />
            {!isAdminRoute && <Header />}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/alterations" element={<Alterations />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/success" element={<Success />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/confirmation-depot" element={<ConfirmationDepot />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
              </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            <Toaster />
          </div>
        </AlterationCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;