import React from 'react';
import { FileText, GraduationCap, Shield, AlertCircle, CheckCircle, Scale } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Terms of Use
          </h1>
        </div>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto mb-2">
          Simple and fair terms for using our Boolean Algebra Solver
        </p>
        <p className="text-sm text-blue-600">
          Last Updated: January 2025
        </p>
      </div>

      {/* Quick Summary */}
      <div className="card-mobile mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">Quick Summary</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Free to Use</h3>
              <p className="text-sm opacity-90">No payment required</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <GraduationCap className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Educational</h3>
              <p className="text-sm opacity-90">For learning purposes</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Safe & Secure</h3>
              <p className="text-sm opacity-90">No data collection</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <Scale className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Fair Use</h3>
              <p className="text-sm opacity-90">Respectful usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Acceptance of Terms</h2>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 leading-relaxed">
            By using the Boolean Algebra Solver, you agree to these Terms of Use. If you don't agree with any part of these terms, 
            please don't use our tool. These terms apply to all users of the Boolean Algebra Solver.
          </p>
        </div>
      </div>

      {/* Permitted Uses */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Permitted Uses</h2>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="font-semibold text-green-800 mb-4 text-lg">You ARE allowed to:</h3>
          <ul className="text-green-700 space-y-3">
            <li className="flex items-start bg-white rounded-lg p-3 border border-green-200">
              <span className="text-green-500 mr-3 mt-0.5">•</span>
              Use the tool for educational purposes (homework, studying, learning)
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-green-200">
              <span className="text-green-500 mr-3 mt-0.5">•</span>
              Use it in classrooms and educational institutions
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-green-200">
              <span className="text-green-500 mr-3 mt-0.5">•</span>
              Share the website link with friends and classmates
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-green-200">
              <span className="text-green-500 mr-3 mt-0.5">•</span>
              Use it for personal learning and skill development
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-green-200">
              <span className="text-green-500 mr-3 mt-0.5">•</span>
              Access the tool from any device, anywhere in the world
            </li>
          </ul>
        </div>
      </div>

      {/* Restrictions */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Restrictions</h2>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <h3 className="font-semibold text-red-800 mb-4 text-lg">You are NOT allowed to:</h3>
          <ul className="text-red-700 space-y-3">
            <li className="flex items-start bg-white rounded-lg p-3 border border-red-200">
              <span className="text-red-500 mr-3 mt-0.5">•</span>
              Copy, modify, or redistribute the source code without permission
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-red-200">
              <span className="text-red-500 mr-3 mt-0.5">•</span>
              Use the tool for commercial purposes without explicit permission
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-red-200">
              <span className="text-red-500 mr-3 mt-0.5">•</span>
              Attempt to hack, break, or damage the tool
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-red-200">
              <span className="text-red-500 mr-3 mt-0.5">•</span>
              Create competing products using our code or content
            </li>
            <li className="flex items-start bg-white rounded-lg p-3 border border-red-200">
              <span className="text-red-500 mr-3 mt-0.5">•</span>
              Remove or modify any copyright notices or credits
            </li>
          </ul>
        </div>
      </div>

      {/* Intellectual Property */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <Scale className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Intellectual Property & Ownership</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Full Ownership Rights</h3>
            <p className="text-blue-700">
              The Boolean Algebra Solver, including all code, design, algorithms, and content, is the exclusive property of 
              <strong> Benaiah Nicholas Nimal</strong>. All rights are reserved.
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-3">Copyright Protection</h3>
            <p className="text-purple-700">
              This tool is protected by copyright laws. The source code, algorithms, user interface, and educational content 
              are original works created by the developer.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Use */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Educational Use Guidelines</h2>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-orange-700">
                <strong>Academic Integrity:</strong> While this tool helps you learn Boolean algebra, always follow your 
                institution's academic integrity policies when using it for assignments.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-orange-700">
                <strong>Learning Aid:</strong> This tool is designed to help you understand Boolean algebra concepts, 
                not to replace learning. Use it to verify your work and understand the steps.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-orange-700">
                <strong>Teacher/Student Use:</strong> Educators are encouraged to use this tool in their classrooms to 
                help students visualize and understand Boolean algebra concepts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Disclaimer</h2>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-700">
                <strong>Educational Tool:</strong> This Boolean Algebra Solver is provided as an educational tool. 
                While we strive for accuracy, always verify critical calculations independently.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-700">
                <strong>No Warranty:</strong> This tool is provided "as is" without any warranties. We're not responsible 
                for any decisions made based on the tool's output.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-700">
                <strong>Availability:</strong> We aim to keep the tool available 24/7, but we don't guarantee uninterrupted access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Contact & Support</h2>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 mb-4">
            Questions about these terms or need help with the tool? We're here to help!
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="space-y-2">
              <p className="text-blue-800 font-medium">
                Email: <a href="mailto:nathanbenaiah4@gmail.com" className="underline hover:text-blue-600">nathanbenaiah4@gmail.com</a>
              </p>
              <p className="text-blue-700">
                Developer: Benaiah Nicholas Nimal
              </p>
              <p className="text-blue-700">
                Portfolio: <a href="https://benaiahnicholasnimal.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">benaiahnicholasnimal.vercel.app</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Changes to Terms */}
      <div className="card-mobile mb-8">
        <div className="flex items-center mb-6">
          <Scale className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-blue-800">Changes to These Terms</h2>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-gray-700">
            We may update these Terms of Use occasionally to reflect changes in our tool or legal requirements. 
            Any changes will be posted on this page with an updated date. Your continued use after changes means you accept the new terms.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-semibold mb-4">Thank You for Using Our Tool!</h2>
        <p className="text-lg opacity-90 mb-2">
          We hope the Boolean Algebra Solver helps you master digital logic concepts.
        </p>
        <p className="text-sm opacity-75 mb-6">
          Made for students and educators worldwide
        </p>
        <a 
          href="/" 
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Using the Solver →
        </a>
      </div>
    </div>
  );
};

export default TermsOfUse; 