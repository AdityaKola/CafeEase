import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from './pages/CustomerMenu';
import BillPage from './pages/BillPage';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TableSelector from './pages/TableSelector';
import TableQrCodes from './pages/TableQrCodes';

function App() {
  const [tableBills, setTableBills] = useState({});

  const mergeBillItems = (existingItems, newItems) => {
    const merged = [...existingItems];

    newItems.forEach((newItem) => {
      const existingIndex = merged.findIndex((item) => item.name === newItem.name);

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          qty: merged[existingIndex].qty + newItem.qty,
          price: newItem.price
        };
      } else {
        merged.push({ ...newItem });
      }
    });

    return merged;
  };

  const addOrderToTableBill = (tableNumber, newItems, totalAmount) => {
    const tableKey = String(tableNumber);

    setTableBills((prev) => {
      const currentTableBill = prev[tableKey] || { items: [], total: 0 };
      return {
        ...prev,
        [tableKey]: {
          items: mergeBillItems(currentTableBill.items, newItems),
          total: currentTableBill.total + totalAmount
        }
      };
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableSelector />} />
        <Route
          path="/table/:tableNumber"
          element={
            <CustomerMenu
              tableBills={tableBills}
              addOrderToTableBill={addOrderToTableBill}
            />
          }
        />
        <Route
          path="/table/:tableNumber/bill"
          element={<BillPage tableBills={tableBills} />}
        />
        <Route path="/qr" element={<TableQrCodes />} />
        <Route path="/chef" element={<KitchenDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
