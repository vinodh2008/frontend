import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <h2 className="text-3xl font-black text-slate-900 mt-4 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-secondary text-primary px-8 py-3 rounded-full font-bold hover:bg-amber-500 transition-colors shadow-lg"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
