function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null; // Don't render if not open
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white text-lg"
          >
            ✖
          </button>
  
          {/* Modal Content */}
          {children}
        </div>
      </div>
    );
  }
  
  export default Modal;
  