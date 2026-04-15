import React from 'react';
import { Helmet } from 'react-helmet';
const ReturnsPolicy = () => {
  return <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Helmet>
        <title>Returns Policy | Home Decor</title>
        <meta name="description" content="Our returns policy outlines how to return items, eligibility, and refund processes." />
      </Helmet>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Returns policy</h1>
      <section className="p-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Eligibility</h2>
        <p className="text-lg text-gray-700 mb-6">
          You can return most items within 30 days of purchase if they are unused, in their original packaging, and in the same condition that you received them. Some exclusions may apply.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">How to return</h2>
        <p className="text-lg text-gray-700 mb-6">
          To initiate a return, please contact our customer service team with your order number. We will provide you with instructions and a return shipping label if applicable.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Refunds</h2>
        <p className="text-lg text-gray-700">
          Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain number of days.
        </p>
      </section>
    </div>;
};
export default ReturnsPolicy;