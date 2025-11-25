import React from 'react';
import PrivacyPolicy from '../components/PrivacyPolicy';

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Centered Container for Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrivacyPolicy />
      </div>
    </div>
  );
}

export default PrivacyPage; 