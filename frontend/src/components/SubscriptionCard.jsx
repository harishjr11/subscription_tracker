import { motion } from "framer-motion";
import dayjs from "dayjs";
import { FaEdit } from "react-icons/fa";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

function SubscriptionCard({ subscription, onEdit }) {
  const renewalDate = subscription.renewalDate
    ? dayjs(subscription.renewalDate).format("MMM DD, YYYY")
    : "No Date Available";

  const statusIcon =
    subscription.status === "active" ? (
      <IoCheckmarkCircle className="text-green-500 text-lg" />
    ) : (
      <IoCloseCircle className="text-red-500 text-lg" />
    );

  return (
    <motion.div
      className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md mb-2 text-white"
      whileHover={{ scale: 1.02 }}
    >
      {/* Left Side: Icon + Details */}
      <div className="flex items-center gap-3">
        {/* Placeholder Icon */}
        <div className="w-10 h-10 bg-gray-700 flex items-center justify-center rounded-full text-lg font-bold">
          {subscription.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="text-lg font-bold">{subscription.name}</h3>
          <p className="text-gray-400 text-sm">{renewalDate}</p>
        </div>
      </div>

      {/* Right Side: Price + Status + Edit */}
      <div className="flex items-center gap-3">
        <p className="text-lg font-semibold">${subscription.price}</p>
        {statusIcon}
        <button
          onClick={() => onEdit(subscription)}
          className="bg-blue-500 px-3 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <FaEdit />
        </button>
      </div>
    </motion.div>
  );
}

export default SubscriptionCard;
