import { Shield, Eye, Database, Mail, Globe, Calendar } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto mb-2">
          Your privacy is important to us. Here's how we handle your information.
        </p>
        <p className="text-sm text-blue-600">
          Last Updated: January 2025
        </p>
      </div>

      {/* Introduction */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <Eye className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">What This Policy Covers</h2>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 leading-relaxed">
            This Privacy Policy explains how the Boolean Algebra Solver handles your information when you use our educational tool. 
            We are committed to protecting your privacy and being transparent about our practices.
          </p>
        </div>
      </div>

      {/* Information We Collect */}
      <section className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Database className="w-6 h-6 mr-2 text-green-600" />
          Information We Collect
        </h2>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">What We DO Collect:</h3>
            <ul className="text-gray-700 space-y-1">
              <li>• Boolean expressions you enter (processed locally in your browser)</li>
              <li>• Basic usage analytics to improve the tool</li>
              <li>• Technical information like browser type and device type</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">What We DON'T Collect:</h3>
            <ul className="text-gray-700 space-y-1">
              <li>• Personal information (name, email, phone number)</li>
              <li>• Account creation or registration data</li>
              <li>• Detailed tracking or browsing history</li>
              <li>• Any information that identifies you personally</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How We Use Information */}
      <section className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-purple-600" />
          How We Use Your Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Primary Uses:</h3>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Process your Boolean expressions locally in your browser
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Provide step-by-step simplification results
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Generate truth tables and K-maps for your expressions
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Analytics Uses:</h3>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Understand which features are most helpful
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Improve the tool's performance and usability
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Fix bugs and add new educational features
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Storage */}
      <section className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Database className="w-6 h-6 mr-2 text-orange-600" />
          Data Storage & Security
        </h2>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-gray-700 mb-3">
            <strong>Local Processing:</strong> Your Boolean expressions are processed entirely in your browser. 
            We don't store your expressions on our servers.
          </p>
          <p className="text-gray-700 mb-3">
            <strong>No Account Required:</strong> You can use this tool without creating an account or providing any personal information.
          </p>
          <p className="text-gray-700">
            <strong>Browser Storage:</strong> We may use local browser storage to remember your preferences and improve your experience.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Mail className="w-6 h-6 mr-2 text-indigo-600" />
          Contact Us
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about this Privacy Policy or how we handle your information, please contact us:
        </p>
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <p className="text-indigo-800 font-medium">
            Email: <a href="mailto:nathanbenaiah4@gmail.com" className="underline hover:text-indigo-600">nathanbenaiah4@gmail.com</a>
          </p>
          <p className="text-indigo-700 text-sm mt-2">
            Developer: Benaiah Nicholas Nimal
          </p>
        </div>
      </section>

      {/* Updates */}
      <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-gray-600" />
          Policy Updates
        </h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. 
          Your continued use of the Boolean Algebra Solver after any changes constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Simple Summary */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Simple Summary</h2>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔒 Privacy First</h3>
            <p className="text-sm">No personal data collection</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">💻 Local Processing</h3>
            <p className="text-sm">Everything runs in your browser</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🆓 Always Free</h3>
            <p className="text-sm">No hidden costs or tracking</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy; 