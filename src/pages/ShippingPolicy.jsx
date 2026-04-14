import React from 'react';
import { Helmet } from 'react-helmet';
const ShippingPolicy = () => {
  return <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Helmet>
        <title>Shipping Policy | Home Decor</title>
        <meta name="description" content="Our shipping policy details delivery times, costs, and available shipping methods." />
      </Helmet>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Shipping policy</h1>
      <section className="p-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery times</h2>
        <p className="text-lg text-gray-700 mb-6">
          We strive to process all orders within 1-3 business days. Once shipped, domestic orders typically arrive within 5-7 business days. International shipping times may vary.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping costs</h2>
        <p className="text-lg text-gray-700 mb-6">
          Shipping costs are calculated at checkout based on your location and the weight of your order. We occasionally offer free shipping promotions, so keep an eye out for those!
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping methods</h2>
        <p className="text-lg text-gray-700">
          We partner with reliable carriers to ensure your items arrive safely. Standard and expedited shipping options are available for most locations.
        </p>
      </section>
    </div>;
};
export default ShippingPolicy;