import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { toPng } from "html-to-image";
import socket from '../socket';
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaShareAlt, FaTruckLoading } from "react-icons/fa";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import UserList from "./UserList";

function SubscriptionCard({ subscription, onEdit }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showChatSelect, setShowChatSelect] = useState(false);
  const [subscriptionToShare, setSubscriptionToShare] = useState(null);
  const snapshotRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5500/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setCurrentUserId(data.user._id);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const renewalDate = subscription.renewalDate
    ? dayjs(subscription.renewalDate).format("MMM DD, YYYY")
    : "No Date Available";

  const statusIcon =
    subscription.status === "active" ? (
      <IoCheckmarkCircle className="text-green-500 text-lg" />
    ) : (
      <IoCloseCircle className="text-red-500 text-lg" />
    );

  const handleShareClick = () => {
    setSubscriptionToShare(subscription);
    setShowChatSelect(true);
  };
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (subscriptionData, chatId) => {
  if (!snapshotRef.current) {
    toast.error("Snapshot element not found.");
    return;
  }

  try {
    setIsSharing(true);
    const image = await toPng(snapshotRef.current, {
      cacheBust: true,
      style: {
        backgroundColor: "#1f2937",
      },
    });

    // ✅ Send image via socket
    socket.emit("send_message", {
      chatId,
      sender: currentUserId,
      type: "image",
      content: image,
      metadata: {
        name: subscriptionData.name,
        price: subscriptionData.price,
        status: subscriptionData.status,
      },
    });

    console.log("Before toast");
    toast.success("Image shared!");
    console.log("After toast");

  } catch (err) {
    console.error("Image share failed:", err);
    toast.error("Image share failed.");
  } finally {
    setIsSharing(false);
  }
};



  return (
    <>
      <motion.div
        className="flex items-center justify-between p-4 rounded-lg shadow-md mb-2 text-white"
        style={{ backgroundColor: "#1f2937" }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: "#374151" }}
          >
            {subscription.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold">{subscription.name}</h3>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              {renewalDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold">${subscription.price}</p>
          {statusIcon}
          <button
            onClick={() => onEdit(subscription)}
            className="px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
            style={{ backgroundColor: "#3b82f6" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#2563eb")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#3b82f6")
            }
          >
            <FaEdit />
          </button>
          <button
            onClick={handleShareClick}
            className="px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
            style={{ backgroundColor: "#10b981" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#059669")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#10b981")
            }
          >
            {isSharing ? <FaTruckLoading /> : <FaShareAlt />}
          </button> 
        </div>
      </motion.div>

      {/* 📸 Hidden Snapshot */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div
          ref={snapshotRef}
          style={{
            width: "300px",
            padding: "16px",
            backgroundColor: "#1f2937",
            borderRadius: "12px",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#374151",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {subscription.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                {subscription.name}
              </div>
              <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                {renewalDate}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              ${subscription.price}
            </div>
            <div style={{ fontSize: "14px" }}>
              {subscription.status === "active"
                ? "✅ Active"
                : "❌ Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* 🧑 Modal for user selection */}
      {showChatSelect && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="p-6 rounded-lg w-96 shadow-lg"
            style={{ backgroundColor: "white", color: "black" }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Select a user to share with
            </h2>

            <UserList
                currentUserId={currentUserId}
                onUserSelect={async (selectedChat) => {
                await handleShare(subscriptionToShare, selectedChat._id);
                setTimeout(() => {
                  setShowChatSelect(false);
                  setSubscriptionToShare(null);
                }, 300); // 300ms delay
              }}
            />




            <button
              onClick={() => {
                setShowChatSelect(false);
                setSubscriptionToShare(null);
              }}
              className="mt-4 text-sm hover:underline"
              style={{ color: "#dc2626" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SubscriptionCard;
