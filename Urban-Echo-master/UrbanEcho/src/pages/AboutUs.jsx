import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Urban Echo</h1>
          
          {/* Mission Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Urban Echo is dedicated to empowering citizens and local authorities to work together 
              in making our communities better. We provide a platform where residents can report 
              urban issues and track their resolution, creating a more transparent and efficient 
              system for urban development.
            </p>
          </section>

          {/* Features Grid */}
          <section className="mb-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Report Issues</h3>
              <p className="text-gray-600">
                Easily report urban issues with detailed information and photos for quick resolution.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor the status of reported issues from submission to resolution.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
              <p className="text-gray-600">
                Join forces with your community to create positive change in your neighborhood.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Subham Nabik</h3>
                <p className="text-gray-600">Backend</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Antarik Tarafdar</h3>
                <p className="text-gray-600">Frontend</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Rajrup Mukherjee</h3>
                <p className="text-gray-600">Frontend</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Sudipta Karmakar</h3>
                <p className="text-gray-600">Backend</p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions or suggestions? We'd love to hear from you.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;