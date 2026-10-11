import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';

function KitchenDashboard() {
  const [token, setToken] = useState(localStorage.getItem("chefToken") || "");
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertColor, setAlertColor] = useState("#3c6e47");

  const isLoggedIn = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("chefToken", token);
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    } else {
      localStorage.removeItem("chefToken");
      setOrders([]);
    }
  }, [token]);

  const showAlert = (msg, isError = false) => {
    setAlertMsg(msg);
    setAlertColor(isError ? "#a94442" : "#3c6e47");
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setToken("");
        showAlert("Session expired. Please login again.", true);
      } else {
        showAlert("Could not load orders. Check server connection.", true);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/chef/login`, { username: username.trim(), password });
      setToken(res.data.token);
      showAlert("Login successful.");
      setUsername("");
      setPassword("");
    } catch {
      showAlert("Invalid username or password.", true);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE}/chef/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } finally {
      setToken("");
      showAlert("Logged out.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/orders/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch {
      showAlert("Could not update order status.", true);
    }
  };

  const removeOrder = async (id) => {
    try {
      await axios.delete(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch {
      showAlert("Could not remove order.", true);
    }
  };

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Chef Order Dashboard</h1>
        <div className="d-flex gap-2">
          {isLoggedIn && (
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          )}
          <Link to="/" className="btn btn-outline-dark btn-sm">Back to Menu</Link>
        </div>
      </div>

      {!isLoggedIn && (
        <section className="menu-card p-3 mb-4">
          <h2 className="h5 mb-3">Chef Login</h2>
          <form className="row g-2" onSubmit={handleLogin}>
            <div className="col-md-5">
              <label htmlFor="chefUser" className="form-label">Username</label>
              <input id="chefUser" className="form-control" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="col-md-5">
              <label htmlFor="chefPass" className="form-label">Password</label>
              <input id="chefPass" className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="col-md-2 d-grid align-items-end">
              <button className="btn btn-dark" type="submit">Login</button>
            </div>
          </form>
          <p className="small text-muted mt-2 mb-0">Default login: chef / admin123</p>
        </section>
      )}

      {isLoggedIn && <p className="text-muted mb-4">Live list of placed orders. Update status as you prepare.</p>}
      
      {alertMsg && <div className="mb-3 fw-semibold" style={{ color: alertColor }}>{alertMsg}</div>}

      {isLoggedIn && (
        <div className="vstack gap-3">
          {orders.length === 0 ? (
            <p className="text-muted mb-0">No orders yet.</p>
          ) : (
            orders.map(order => {
              const itemsText = order.items.map(item => `${item.qty} x ${item.name}`).join(", ");
              return (
                <div key={order.id} className="menu-card p-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <h2 className="h6 mb-1">Order #{order.id}</h2>
                      <p className="mb-1 small">Customer: {order.customerName}</p>
                      <p className="mb-1 small">Table: {order.tableNumber || "-"}</p>
                      <p className="mb-1 small">Items: {itemsText}</p>
                      <p className="mb-1 small">Total: INR {order.total}</p>
                      <p className="mb-0 small">Status: <strong>{order.status}</strong></p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => updateStatus(order.id, 'Preparing')}>Preparing</button>
                      <button className="btn btn-sm btn-dark" onClick={() => updateStatus(order.id, 'Completed')}>Completed</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeOrder(order.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}

export default KitchenDashboard;
