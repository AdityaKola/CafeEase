export const mockMenuItems = [
  { id: 1, name: 'Espresso', description: 'Rich and bold espresso shot.', price: 3.50, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&q=80' },
  { id: 2, name: 'Cappuccino', description: 'Espresso with steamed milk and foam.', price: 4.50, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80' },
  { id: 3, name: 'Avocado Toast', description: 'Smashed avocado on sourdough bread.', price: 8.00, category: 'Food', available: true, image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&q=80' },
  { id: 4, name: 'Blueberry Muffin', description: 'Freshly baked muffin with blueberries.', price: 3.00, category: 'Pastries', available: true, image: 'https://images.unsplash.com/photo-1525124568695-c4c6cd3ea847?w=500&q=80' },
  { id: 5, name: 'Iced Latte', description: 'Chilled espresso and milk over ice.', price: 5.00, category: 'Beverages', available: false, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80' },
];

export const mockOrders = [
  { id: 101, customerName: 'Alice', items: [{ name: 'Espresso', qty: 2 }], total: 7.00, status: 'Pending', time: '10:30 AM' },
  { id: 102, customerName: 'Bob', items: [{ name: 'Avocado Toast', qty: 1 }, { name: 'Cappuccino', qty: 1 }], total: 12.50, status: 'Preparing', time: '10:35 AM' },
  { id: 103, customerName: 'Charlie', items: [{ name: 'Blueberry Muffin', qty: 3 }], total: 9.00, status: 'Completed', time: '10:15 AM' },
];
