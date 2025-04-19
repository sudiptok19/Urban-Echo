import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => (
  <section className="text-center py-20">
    <h2 className="animate-pulse text-4xl font-bold mb-6">Amplify Your Community&apos;s Voice</h2>
    <p className="fade-in text-xl mb-8 max-w-2xl mx-auto">
      Report local issues, upvote important problems, and help authorities prioritize what matters most in your neighborhood.
    </p>
    <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
      Get Started
    </Link>
    <section className="grid md:grid-cols-3 gap-8 text-center mt-20 mb-2 ">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Report Issues</h3>
                <p>Report Issues Effortlessly report problems in your local area. Whether it’s a broken streetlight, a pothole, or any other issue, you can quickly share it with just a few clicks.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Community Voting</h3>
                <p>Have your voice heard by upvoting issues that require urgent attention . Your votes ensure that the most pressing concerns get attention, allowing authorities to resolve high-priority matters first.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
                <p>See when reported problems get acknowledged and resolved. Get real-time updates on the progress of each issue, ensuring transparency and accountability</p>
            </div>
        </section>
  </section>
);

export default HeroSection;
