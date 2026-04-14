import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/assets/logo-calista.png" alt="ATELIER calista Logo" className="h-16 w-auto mb-4" />
            <p className="mt-4 text-sm text-gray-600">
              Services de retouches sur mesure.
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Navigation
            </span>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/alterations" className="text-sm text-gray-600 hover:text-gray-900">Retouches</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">À propos</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
              </li>
              <li>
                <a href="https://refashion.fr" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">Re_fashion</a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Connect
            </span>
            <div className="mt-4 flex space-x-4">
              <a href="https://www.instagram.com/ateliercalista/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/p/Atelier-Calista-61573493524642/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
           <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            <Link to="/cgv" className="text-sm text-gray-600 hover:text-gray-900">Conditions Générales de Vente</Link>
            <Link to="/mentions-legales" className="text-sm text-gray-600 hover:text-gray-900">Mentions légales</Link>
            <Link to="/politique-de-confidentialite" className="text-sm text-gray-600 hover:text-gray-900">Politique de confidentialité</Link>
          </div>
          <p className="text-sm text-gray-600 text-center">© 2025 Atelier Calista. Tous droits réservés.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;
