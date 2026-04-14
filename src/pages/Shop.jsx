import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList';
const Shop = () => {
  return <>
      <Helmet>
        <title>Shop Vintage Furniture & Decor - Midcentury Decor</title>
        <meta name="description" content="Browse our curated collection of vintage furniture, lighting, and home decor. Unique midcentury modern pieces from Berlin." />
      </Helmet>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="mb-12">
            <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-4">Shop our collection</h1>
            <p className="text-lg text-gray-600">
              Discover unique vintage and retro pieces for your home
            </p>
          </motion.div>

          <ProductsList />
        </div>
      </div>
    </>;
};
export default Shop;