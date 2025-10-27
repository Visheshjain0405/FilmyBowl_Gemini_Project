import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your existing components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleContent from './pages/ArticleContent';
import RewrittenArticlesPage from './pages/RewrittenArticlesPage';
import RewrittenArticleView from './pages/RewrittenArticleView';

const Settings = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600">Application settings will be available here.</p>
      </div>
    </div>
  </div>
);

const Profile = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
        <p className="text-gray-600">User profile management will be available here.</p>
      </div>
    </div>
  </div>
);

// Main App Component
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar is rendered on all pages */}
        <Navbar />
        
        {/* Main Content Area */}
        <main>
          <Routes>
            {/* Default route redirects to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Articles routes */}
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleContent />} />
            
            {/* Other routes */}
            <Route path="/rewritten-articles" element={<RewrittenArticlesPage />} />
            <Route path='/rewritten-articles/:id' element={<RewrittenArticleView/>}/>
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center max-w-md">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;