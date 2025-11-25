import React from 'react';
import AdSpace from './AdSpace';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main Layout Component
 * Provides centered content area with ad sidebars on desktop
 * Mobile: Full-width content, no sidebars
 */
const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex flex-col lg:flex-row max-w-[1920px] mx-auto relative">
        {/* Left Ad Sidebar - Desktop Only */}
        <aside className="hidden lg:block lg:w-[200px] xl:w-[250px] flex-shrink-0 ad-sidebar">
          <div className="lg:px-3 xl:px-4 lg:py-4 space-y-4">
            <div className="sticky top-4">
              <AdSpace 
                size="skyscraper" 
                position="left"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 ${className}`}>
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        {/* Right Ad Sidebar - Desktop Only */}
        <aside className="hidden lg:block lg:w-[200px] xl:w-[250px] flex-shrink-0 ad-sidebar">
          <div className="lg:px-3 xl:px-4 lg:py-4 space-y-4">
            <div className="sticky top-4">
              <AdSpace 
                size="skyscraper" 
                position="right"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Layout;

