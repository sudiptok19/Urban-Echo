import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>

          <div className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-blue-600 text-2xl">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                  <a href="mailto:urbanecho@gmail.com" className="text-blue-600 hover:text-blue-700">
                    urbanecho@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-blue-600 text-2xl">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                  <a href="tel:+919877233456" className="text-blue-600 hover:text-blue-700">
                    +91 9877233456
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;