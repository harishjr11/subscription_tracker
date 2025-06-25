import { useState, useEffect } from "react";
import dayjs from "dayjs";

function EditSubscriptionModal({ subscription, onClose, onUpdate }) {
  const [name, setName] = useState(subscription.name);
  const [price, setPrice] = useState(subscription.price);
  const [category, setCategory] = useState(subscription.category);
  const [frequency, setFrequency] = useState(subscription.frequency);
  const [paymentMethod, setPaymentMethod] = useState(subscription.paymentMethod);
  const [startDate, setStartDate] = useState("");

  // 🛠 Proper useEffect for loading startDate
  useEffect(() => {
    if (subscription?.startDate) {
      setStartDate(dayjs(subscription.startDate).format("YYYY-MM-DD")); // Convert date to input-friendly format
    }
  }, [subscription]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedSub = { 
      ...subscription, 
      name, 
      price, 
      category, 
      paymentMethod, 
      frequency, 
      startDate // Include updated start date
    };

    try {
      const response = await fetch(`http://localhost:5500/api/v1/subscriptions/${subscription._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedSub),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate(data.data);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-auto bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-96">
        <h2 className="text-xl font-bold mb-4">Edit Subscription</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-3 bg-gray-700 rounded-lg" />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 mb-3 bg-gray-700 rounded-lg" />
          <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full p-2 mb-3 bg-gray-700 rounded-lg" />
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 mb-3 bg-gray-700 rounded-lg" />
          <input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 mb-3 bg-gray-700 rounded-lg" />

          {/* 🛠 Fix: Ensure date is controlled and formatted correctly */}
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white"
          />

          <div className="flex justify-between">
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded-md">Save</button>
            <button type="button" onClick={onClose} className="bg-red-500 px-4 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubscriptionModal;
