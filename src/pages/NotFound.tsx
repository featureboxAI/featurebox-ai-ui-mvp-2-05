
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', window.location.pathname);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-50 rounded-full">
            <AlertTriangle size={48} className="text-yellow-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. The URL may be misspelled or the page you're looking for is no longer available.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/')} size="lg">
            Go to Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} size="lg">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
