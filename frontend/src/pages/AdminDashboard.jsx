import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';

const emptyForm = {
  name: '',
  category: 'Beverages',
  price: '',
  description: ''
};

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('chefToken') || '');
  const [menuItems, setMenuItems] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');
  const existingCategories = [...new Set(menuItems.map((item) => item.category?.trim()).filter(Boolean))];
  const categoryOptions = existingCategories.length
    ? existingCategories
    : ['Beverages', 'Snacks', 'Desserts'];

  useEffect(() => {
    if (token) {
      localStorage.setItem('chefToken', token);
      fetchMenuItems();
    } else {
      localStorage.removeItem('chefToken');
      setMenuItems([]);
    }
  }, [token]);

  const showAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
  };

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setToken('');
        showAlert('Session expired. Please login again.', 'error');
      } else {
        showAlert('Could not load menu items.', 'error');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/chef/login`, {
        username: username.trim(),
        password
      });
      setToken(res.data.token);
      setUsername('');
      setPassword('');
      showAlert('Login successful.');
    } catch {
      showAlert('Invalid username or password.', 'error');
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
      setToken('');
      showAlert('Logged out.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsAddingNewCategory(false);
    setNewCategory('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: isAddingNewCategory ? newCategory.trim() : form.category.trim(),
      price: Number(form.price),
      description: form.description.trim()
    };

    if (!payload.name || !payload.category || !payload.price || payload.price <= 0) {
      showAlert('Please fill all required fields with valid values.', 'error');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/menu/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Menu item updated successfully.');
      } else {
        await axios.post(`${API_BASE}/menu`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Menu item added successfully.');
      }

      resetForm();
      fetchMenuItems();
    } catch {
      showAlert('Could not save menu item.', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIsAddingNewCategory(false);
    setNewCategory('');
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('Menu item deleted.');
      if (editingId === id) resetForm();
      fetchMenuItems();
    } catch {
      showAlert('Could not delete menu item.', 'error');
    }
  };

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Admin Dashboard</h1>
        <div className="d-flex gap-2">
          {token && (
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          )}
          <Link to="/" className="btn btn-outline-dark btn-sm">Back to Home</Link>
        </div>
      </div>

      {!token ? (
        <section className="menu-card p-3 mb-4">
          <h2 className="h5 mb-3">Admin Login</h2>
          <form className="row g-2" onSubmit={handleLogin}>
            <div className="col-md-5">
              <label htmlFor="adminUser" className="form-label">Username</label>
              <input id="adminUser" className="form-control" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="col-md-5">
              <label htmlFor="adminPass" className="form-label">Password</label>
              <input id="adminPass" className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="col-md-2 d-grid align-items-end">
              <button className="btn btn-dark" type="submit">Login</button>
            </div>
          </form>
          <p className="small text-muted mt-2 mb-0">Default login: chef / admin123</p>
        </section>
      ) : (
        <div className="row g-4">
          <div className="col-lg-5">
            <section className="menu-card p-3">
              <h2 className="h5 mb-3">{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Item Name</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="menuCategory" className="form-label">Category</label>
                  <select id="menuCategory" name="category" className="form-select" value={form.category} onChange={handleInputChange} required disabled={isAddingNewCategory}>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-link btn-sm px-0 mt-1"
                    aria-expanded={isAddingNewCategory}
                    onClick={() => {
                      setIsAddingNewCategory((current) => !current);
                      setNewCategory('');
                    }}
                  >
                    {isAddingNewCategory ? 'Choose an existing category' : '+ Add a new category'}
                  </button>
                  {isAddingNewCategory && (
                    <div className="mt-2">
                      <label htmlFor="newMenuCategory" className="form-label">New category name</label>
                      <input
                        id="newMenuCategory"
                        className="form-control"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="e.g. Breakfast"
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input name="price" type="number" min="1" step="0.01" className="form-control" value={form.price} onChange={handleInputChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleInputChange} />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-dark">{editingId ? 'Update Item' : 'Add Item'}</button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-dark" onClick={resetForm}>Cancel</button>
                  )}
                </div>
              </form>
            </section>
          </div>

          <div className="col-lg-7">
            <section className="menu-card p-3">
              <h2 className="h5 mb-3">Current Menu</h2>
              <div className="vstack gap-3">
                {menuItems.length === 0 ? (
                  <p className="text-muted mb-0">No menu items yet.</p>
                ) : (
                  menuItems.map((item) => (
                    <div key={item.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                          <h3 className="h6 mb-1">{item.name}</h3>
                          <p className="small text-muted mb-1">{item.category}</p>
                          <p className="small text-muted mb-1">{item.description || 'No description'}</p>
                          <p className="mb-0 fw-semibold">INR {item.price}</p>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(item)}>Edit</button>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {alertMsg && (
        <div className={`mt-3 fw-semibold ${alertType === 'error' ? 'text-danger' : 'text-success'}`}>
          {alertMsg}
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
