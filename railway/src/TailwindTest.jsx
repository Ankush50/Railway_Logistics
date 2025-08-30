import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Tailwind CSS Test</h1>
      <p className="text-sm">If you can see this styled properly, Tailwind is working!</p>
      <button className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
        Test Button
      </button>
    </div>
  );
};

export default TailwindTest;
