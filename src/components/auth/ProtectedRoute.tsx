import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserIds?: string[]; // Optional: restrict to specific user IDs
  restrictedUserIds?: string[]; // Optional: block specific user IDs
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserIds, 
  restrictedUserIds 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User ID-based access control
  if (user?.sub) {
    const userId = user.sub;
    
    // Check if user is in restricted list
    if (restrictedUserIds && restrictedUserIds.includes(userId)) {
      console.log(`Access denied for user: ${userId}`);
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Check if user is in allowed list (if specified)
    if (allowedUserIds && !allowedUserIds.includes(userId)) {
      console.log(`Access denied for user: ${userId}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;