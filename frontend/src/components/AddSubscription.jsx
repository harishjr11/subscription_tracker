import { useState } from "react";
import { motion } from "framer-motion";

function AddSubscription({ addSubscription }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false); // Show/hide modal

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !startDate || !frequency || !category || !paymentMethod) {
      alert("Please fill out all fields.");
      return;
    }

    addSubscription({ name, price, startDate, frequency, category, paymentMethod });

    // Reset form
    setName("");
    setPrice("");
    setStartDate("");
    setFrequency("");
    setCategory("");
    setPaymentMethod("");

    // Close the modal after submission
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      {/* Button to open modal */}
      <motion.button
        whileTap={{ scale: 1.05 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        //className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-lg shadow-md font-semibold w-full hover:opacity-90"
      >
        + Add
      </motion.button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent opacity-100 backdrop-blur-xl z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-96"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Add Subscription
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Service Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />

              <input
                type="text"
                placeholder="Frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />

              <input
                type="text"
                placeholder="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 mb-3 border-none rounded-lg bg-gray-800 text-white"
              />

              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold w-5/12"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-semibold w-5/12"
                >
                  Close
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AddSubscription;
