import React from 'react';
import { Link, useParams } from 'react-router-dom';

function BillPage({ tableBills }) {
  const { tableNumber } = useParams();
  const currentTableBill = tableBills?.[String(tableNumber)] || { items: [], total: 0 };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm border-0 p-4">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold mb-1">CafeEase</h1>
              <p className="mb-0 text-muted">Table {tableNumber} bill</p>
            </div>

            {currentTableBill.items.length > 0 ? (
              <>
                <div className="d-flex justify-content-between small text-muted border-bottom pb-2 mb-3">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Amount</span>
                </div>

                {currentTableBill.items.map((entry) => (
                  <div key={entry.name} className="d-flex justify-content-between py-2 border-bottom">
                    <span>{entry.name}</span>
                    <span>{entry.qty}</span>
                    <span>INR {entry.price * entry.qty}</span>
                  </div>
                ))}

                <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                  <span>Total</span>
                  <span>INR {currentTableBill.total}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted">
                No items have been ordered for this table yet.
              </div>
            )}

            <div className="d-flex justify-content-between gap-2 mt-4">
              <Link to={`/table/${tableNumber}`} className="btn btn-outline-dark w-50">
                Back to Menu
              </Link>
              <button type="button" className="btn btn-dark w-50" onClick={() => window.print()}>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BillPage;
