import { useState, useEffect } from "react";
import AddSubscription from "./AddSubscription";
import SubscriptionControls from "./SubscriptionControls";
import SubscriptionCard from "./SubscriptionCard";
import { motion } from "framer-motion";
import EditSubscriptionModal from "./EditSubscriptionModal";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [filterPrice, setFilterPrice] = useState(0);
  const [search, setSearch] = useState("");
  const [editingSubscription, setEditingSubscription] = useState(null);

  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);
  };

  const handleUpdateSubscription = (updatedSubscription) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub._id === updatedSubscription._id ? updatedSubscription : sub))
    );
    setEditingSubscription(null);
  };

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:5500/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setUserId(data.user._id);
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Function to fetch subscriptions
const fetchSubscriptions = async () => {
  if (!userId) return;

  try {
    const response = await fetch(`http://localhost:5500/api/v1/subscriptions/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await response.json();
    
    if (data.success) {
      setSubscriptions(data.data);
    } else {
      console.error("Failed to fetch subscriptions:", data.message);
    }
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
  }
};

  // Fetch subscriptions when userId is available
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5500/api/v1/subscriptions/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await response.json();

        if (data.success) {
          setSubscriptions(data.data);
        } else {
          console.error("Failed to fetch subscriptions:", data.message);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]); // ✅ Ensures latest userId is used

  // Function to add a new subscription
  const addSubscription = async (newSub) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
  
      const subscriptionData = { ...newSub, user: userId };
  
      // Create temporary subscription for instant UI update
      const tempId = `temp-${Date.now()}`;
      const tempSubscription = { 
        ...subscriptionData, 
        _id: tempId,
        name: newSub.name || "Untitled", 
        price: newSub.price || 0, 
      };
  
      setSubscriptions((prev) => [...prev, tempSubscription]);
  
      // Send request to backend
      const response = await fetch("http://localhost:5500/api/v1/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        // ✅ Instead of updating manually, force re-fetch
        fetchSubscriptions();  // 🔥 This will ensure latest data from backend
      } else {
        console.error("Failed to add subscription:", data.message);
        setSubscriptions((prev) => prev.filter((sub) => sub._id !== tempId));
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
    }
  };
  

  // Apply sorting, filtering, and search together
  const processedSubscriptions = subscriptions
    .filter((sub) => (sub.name ? sub.name.toLowerCase() : "").includes(search.toLowerCase())) // Search filter
    .filter((sub) => sub.price >= filterPrice) // Price filter
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "renewalDate") return new Date(a.renewalDate) - new Date(b.renewalDate);
      return 0;
    });

  if (loading) return <p>Loading subscriptions...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-gray-100 text-black dark:bg-gray-900 dark:text-white rounded-lg">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
        Your Subscriptions
      </h2>


      {/* Search Input */}
      <input
        type="text"
        placeholder="Search subscriptions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
      />

      {/* Sorting & Filtering Controls */}
      <SubscriptionControls setSortBy={setSortBy} setFilterPrice={setFilterPrice} />

      {/* Subscription Cards with Animation */}
      {processedSubscriptions.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          {processedSubscriptions.map((sub) => (
            <SubscriptionCard key={sub._id} subscription={sub} onEdit={handleEditClick} />
          ))}
        </motion.div>
      ) : (
        <p className="text-gray-400 text-center">No subscriptions found.</p>
      )}

      {editingSubscription && (
        <EditSubscriptionModal 
          subscription={editingSubscription} 
          onClose={() => setEditingSubscription(null)}
          onUpdate={handleUpdateSubscription}
        />
      )}

      {/* Add Subscription Component */}
      <AddSubscription addSubscription={addSubscription} />
    </div>
  );
}

export default Subscriptions;
