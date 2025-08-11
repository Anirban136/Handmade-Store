// Utility function to format prices in Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Function to format price without currency symbol (just the number)
export const formatPriceNumber = (price) => {
  return new Intl.NumberFormat('en-IN').format(price);
}; 