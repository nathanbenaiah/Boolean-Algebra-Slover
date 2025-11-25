import React from 'react';
import TermsOfUse from '../components/TermsOfUse';

function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Centered Container for Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TermsOfUse />
      </div>
    </div>
  );
}

export default TermsPage; 