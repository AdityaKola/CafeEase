import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function TableSelector() {
  const navigate = useNavigate();
  const [customTable, setCustomTable] = useState('');

  const tables = Array.from({ length: 10 }, (_, index) => index + 1);

  const handleGoToTable = () => {
    const tableNumber = Number(customTable);
    if (tableNumber >= 1) {
      navigate(`/table/${tableNumber}`);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-4">
            <h1 className="display-5 fw-bold">CafeEase</h1>
            <p className="text-muted mb-0">Select your table to begin ordering.</p>
            <p className="text-muted mb-0">Choose a table to begin ordering without re-entering it.</p>
          </div>

          <div className="card shadow-sm border-0 p-4 mb-4">
            <div className="row g-3">
              {tables.map((table) => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={table}>
                  <button
                    type="button"
                    className="btn btn-dark w-100 py-3"
                    onClick={() => navigate(`/table/${table}`)}
                  >
                    Table {table}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-sm border-0 p-4 mb-3">
            <label htmlFor="tableNumber" className="form-label fw-semibold">Or enter a table number</label>
            <div className="input-group">
              <input
                id="tableNumber"
                type="number"
                min="1"
                className="form-control"
                placeholder="e.g. 12"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={handleGoToTable}
                disabled={!customTable || Number(customTable) < 1}
              >
                Open Table
              </button>
            </div>
          </div>

          <div className="text-center">
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Link to="/chef" className="btn btn-outline-dark">Chef Dashboard</Link>
              <Link to="/admin" className="btn btn-dark">Admin Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableSelector;
