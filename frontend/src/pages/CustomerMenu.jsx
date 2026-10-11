import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { API_BASE } from '../config/api';

const defaultMenuItems = [
  { id: 1, name: "Cappuccino", category: "Beverages", price: 120, description: "Espresso with steamed milk foam." },
  { id: 2, name: "Cold Coffee", category: "Beverages", price: 140, description: "Chilled coffee blended with milk." },
  { id: 3, name: "Masala Chai", category: "Beverages", price: 60, description: "Indian spiced tea served hot." },
  { id: 4, name: "Veg Sandwich", category: "Snacks", price: 110, description: "Toasted sandwich with fresh veggies." },
  { id: 5, name: "Paneer Wrap", category: "Snacks", price: 150, description: "Soft wrap with paneer filling." },
  { id: 6, name: "Brownie", category: "Desserts", price: 90, description: "Warm chocolate brownie square." }
];

function CustomerMenu(props) {
  const { tableNumber } = useParams();
  const routeTable = Number(tableNumber);
  const isTableFixed = Number.isInteger(routeTable) && routeTable > 0;

  const [filter, setFilter] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOrderMsg, setCartOrderMsg] = useState("");
  const [cartName, setCartName] = useState("");
  const [cartTable, setCartTable] = useState(isTableFixed ? String(routeTable) : "");
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  const previousTableRef = useRef();

  const currentTableKey = String(routeTable || "");
  const currentTableBill = props.tableBills?.[currentTableKey] || { items: [], total: 0 };
  const menuPriceMap = Object.fromEntries(menuItems.map((item) => [item.name, item.price]));

  useEffect(() => {
    if (isTableFixed) {
      setCartTable(String(routeTable));
    }

    if (previousTableRef.current !== undefined && previousTableRef.current !== routeTable) {
      setCartName("");
    }

    previousTableRef.current = routeTable;
  }, [routeTable, isTableFixed]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_BASE}/menu`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMenuItems(res.data);
        }
      } catch {
        setMenuItems(defaultMenuItems);
      }
    };

    fetchMenu();
  }, []);

  const categories = ["All", ...new Set(menuItems.map((item) => item.category || "Other"))];
  const filteredItems = filter === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === filter);

  const addToCart = (item) => {
    setCartOrderMsg("");
    setCart((prev) => {
      const found = prev.find((entry) => entry.id === item.id);
      if (found) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartOrderMsg("");
    setCart((prev) => prev.filter((entry) => entry.id !== id));
  };

  const updateQty = (id, delta) => {
    setCartOrderMsg("");
    setCart((prev) =>
      prev
        .map((entry) => {
          if (entry.id !== id) return entry;
          const nextQty = entry.qty + delta;
          return nextQty > 0 ? { ...entry, qty: nextQty } : null;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartOrderMsg("");
  };

  const placeCartOrder = async () => {
    if (!cart.length) return;

    const resolvedTableNumber = isTableFixed ? routeTable : Number(cartTable);

    if (!cartName.trim() || resolvedTableNumber < 1) {
      setCartOrderMsg("Please enter name and valid table number.");
      return;
    }

    try {
      const payload = {
        customerName: cartName.trim(),
        tableNumber: resolvedTableNumber,
        type: "Cart",
        items: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price
        }))
      };

      await axios.post(`${API_BASE}/orders`, payload);

      const totalItems = cart.reduce((sum, entry) => sum + entry.qty, 0);
      const orderTotal = cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
      const cartItems = cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price
      }));

      props.addOrderToTableBill?.(resolvedTableNumber, cartItems, orderTotal);
      setCartOrderMsg(`Order placed successfully for ${totalItems} item(s) at Table ${resolvedTableNumber}.`);
      setCart([]);
      if (!isTableFixed) {
        setCartTable("");
      }
    } catch {
      setCartOrderMsg("Could not place order. Please try again.");
    }
  };

  const cartTotal = cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);

  const handleQuickOrder = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const table = isTableFixed ? routeTable : Number(e.target.table.value);
    const item = e.target.item.value;
    const qty = Number(e.target.qty.value);

    if (!name || !item || qty < 1 || table < 1) {
      document.getElementById("orderMsg").textContent = "Please fill all fields correctly.";
      return;
    }

    try {
      const orderTotal = (menuPriceMap[item] || 0) * qty;
      const singleItem = { name: item, qty, price: menuPriceMap[item] || 0 };
      await axios.post(`${API_BASE}/orders`, {
        customerName: name,
        tableNumber: table,
        type: "Quick Form",
        items: [singleItem]
      });

      props.addOrderToTableBill?.(table, [singleItem], orderTotal);
      document.getElementById("orderMsg").textContent = `Thanks ${name}! Table ${table} order for ${qty} x ${item} is confirmed.`;
      e.target.name.value = name;
      if (!isTableFixed) {
        setCartTable("");
      }
    } catch {
      document.getElementById("orderMsg").textContent = "Could not place order. Please check server and try again.";
    }
  };

  return (
    <>
      <header className="hero text-center py-5 px-3">
        <h1 className="display-5 fw-bold mb-2">CafeEase</h1>
        <p className="lead mb-0">Fresh coffee, warm snacks, clean vibes.</p>
        <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
          <Link to="/" className="btn btn-sm btn-outline-dark">Choose Table</Link>
          <a href="/chef" className="btn btn-sm btn-dark">Open Chef Dashboard</a>
          <Link to="/admin" className="btn btn-sm btn-outline-dark">Open Admin Dashboard</Link>
        </div>
      </header>

      <main className="container pb-5 mt-4">
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h2 className="h4 mb-0">Menu</h2>
            <Link to={`/table/${routeTable}/bill`} className="btn btn-sm btn-outline-dark">
              View Bill
            </Link>
          </div>

          <div>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn ${filter === cat ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => setFilter(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="row g-3">
              {filteredItems.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.id}>
                  <div className="menu-card p-3 h-100">
                    <h3 className="h6 mb-1">{item.name}</h3>
                    <p className="mb-2 small">{item.description || item.desc || "Freshly prepared item."}</p>
                    <p className="price mb-2">INR {item.price}</p>
                    <button
                      className="btn btn-sm btn-dark"
                      onClick={() => addToCart(item)}
                      type="button"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="menu-card p-3 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="h6 mb-0">Cart</h3>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={placeCartOrder}
                    type="button"
                    disabled={!cart.length}
                  >
                    Place Order
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearCart}
                    type="button"
                    disabled={!cart.length}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {!cart.length ? (
                <p className="mb-0 small">Your cart is empty.</p>
              ) : (
                <div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small mb-1">Name</label>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        value={cartName}
                        onChange={(e) => setCartName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    {!isTableFixed && (
                      <div className="col-md-6">
                        <label className="form-label small mb-1">Table Number</label>
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          min="1"
                          value={cartTable}
                          onChange={(e) => setCartTable(e.target.value)}
                          placeholder="Enter table number"
                        />
                      </div>
                    )}
                  </div>
                  <ul className="list-group mb-3">
                    {cart.map((entry) => (
                      <li
                        key={entry.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{entry.name}</strong>
                          <div className="small text-muted">Qty: {entry.qty}</div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center border rounded px-2 py-1 quantity-stepper">
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(entry.id, -1)}
                              type="button"
                              aria-label={`Decrease quantity for ${entry.name}`}
                            >
                              −
                            </button>
                            <span className="mx-2 small fw-semibold">{entry.qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(entry.id, 1)}
                              type="button"
                              aria-label={`Increase quantity for ${entry.name}`}
                            >
                              +
                            </button>
                          </div>
                          <span className="price mb-0">INR {entry.price * entry.qty}</span>
                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => removeFromCart(entry.id)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="fw-bold mb-0">Total: INR {cartTotal}</p>
                </div>
              )}
              <p className="fw-semibold mt-3 mb-0">Table bill so far: INR {currentTableBill.total}</p>
              {cartOrderMsg && <p className="mt-3 mb-0 fw-semibold text-success">{cartOrderMsg}</p>}
            </div>
          </div>
        </section>

        <style>{`
          .quantity-stepper {
            gap: 0.25rem;
          }

          .qty-btn {
            border: none;
            background: transparent;
            color: #111;
            font-size: 1.2rem;
            line-height: 1;
            font-weight: 700;
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            cursor: pointer;
            text-decoration: none;
          }

          .qty-btn:hover {
            opacity: 0.75;
          }

          .qty-btn:focus {
            outline: none;
          }
        `}</style>

        <section className="mb-4">
          <h2 className="h5">Quick Order Form</h2>
          <form id="orderForm" className="row g-3" onSubmit={handleQuickOrder}>
            <div className="col-md-4">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                name="name"
                className="form-control"
                type="text"
                value={cartName}
                onChange={(e) => setCartName(e.target.value)}
                required
              />
            </div>
            {!isTableFixed && (
              <div className="col-md-3">
                <label htmlFor="table" className="form-label">Table Number</label>
                <input id="table" name="table" className="form-control" type="number" min="1" required />
              </div>
            )}
            {isTableFixed && (
              <div className="col-md-3 d-flex align-items-end">
                <div className="alert alert-light border mb-0 w-100 py-2 px-3">
                  <strong>Table {routeTable}</strong>
                </div>
              </div>
            )}
            <div className="col-md-3">
              <label htmlFor="item" className="form-label">Item</label>
              <select id="item" name="item" className="form-select" required>
                <option value="">Choose...</option>
                {menuItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="qty" className="form-label">Quantity</label>
              <input id="qty" name="qty" className="form-control" type="number" min="1" defaultValue="1" required />
            </div>
            <div className="col-12">
              <button className="btn btn-dark" type="submit">Place Order</button>
            </div>
          </form>
          <p id="orderMsg" className="mt-3 mb-0 fw-semibold"></p>
        </section>
      </main>
    </>
  );
}

export default CustomerMenu;
