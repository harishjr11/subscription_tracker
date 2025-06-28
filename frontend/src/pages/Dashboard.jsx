import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#161b22] rounded-2xl shadow-md p-8 space-y-4 border border-[#30363d]">
        <h1 className="text-2xl font-bold text-blue-400 underline">Dashboard</h1>
        <p>Welcome to the dashboard! Here you can manage your settings and view your data.</p>
        <p>Use the navigation menu to access different sections of the application.</p>
        <p>Make sure to check out the latest updates and features!</p>
        <p>If you have any questions, feel free to reach out to support.</p>
        <p>Enjoy your experience!</p>
      </div>
    </div>
  );
};

export default Dashboard;
