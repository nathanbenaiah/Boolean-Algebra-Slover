import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="container-mobile section-mobile">
      {/* Developer Section */}
      <section className="mb-8">
        <div className="card-mobile">
          <div className="text-center">
            {/* Picture on top */}
            <div className="mb-6">
              <img 
                src="/benaiah.jpg" 
                alt="Benaiah Nicholas Nimal" 
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-200 mx-auto"
              />
            </div>
            
            {/* Meet the Developer heading */}
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Meet the Developer</h2>
            
            {/* Name */}
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Benaiah Nicholas Nimal</h3>
            
            {/* Description */}
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              A passionate believer and software developer dedicated to creating technology that serves God's kingdom and helps people grow in their faith through accessible educational tools.
            </p>
            
            {/* Links as plain text in same line */}
            <div className="text-blue-600">
              <a 
                href="https://www.instagram.com/bible_aura.xyz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors mr-4"
              >
                Instagram
              </a>
              <a 
                href="mailto:nathanbenaiah4@gmail.com" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors mr-4"
              >
                Email
              </a>
              <a 
                href="https://benaiahnicholasnimal.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors mr-4"
              >
                Portfolio
              </a>
              <a 
                href="https://www.bibleaura.xyz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Bible AI
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-blue-800 text-white rounded-xl shadow-lg">
        <div className="px-6 py-4 text-center">
          <p className="text-sm">
            © 2025 Boolean Algebra Solver. All rights reserved. Developed by{' '}
            <a 
              href="https://www.instagram.com/bible_aura.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white hover:underline transition-colors"
            >
              Benaiah Nicholas Nimal
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer; 