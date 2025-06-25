import { useState } from "react";

function SubscriptionControls({ setSortBy, setFilterPrice }) {
  return (
    <div className="flex justify-between items-center mb-4">
      {/* Sorting Dropdown */}
      <select
        onChange={(e) => setSortBy(e.target.value)}
        className="p-2 bg-white text-black dark:bg-gray-800 dark:text-white rounded-md"
      >
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
        <option value="renewalDate">Sort by Next Billing</option>
      </select>

      {/* Filtering Input */}
      <input
        type="number"
        placeholder="Min Price"
        onChange={(e) => setFilterPrice(Number(e.target.value))}
        className="p-2 bg-white text-black dark:bg-gray-800 dark:text-white rounded-md"
      />
    </div>
  );
}

export default SubscriptionControls;
