import React from 'react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

function TableQrCodes() {
  const tables = Array.from({ length: 10 }, (_, index) => index + 1);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="container py-5 qr-print-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 qr-print-header">
        <div>
          <h1 className="display-6 fw-bold mb-1">CafeEase QR Codes</h1>
          <p className="text-muted mb-0">Print these and place one at each table.</p>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-dark btn-sm" onClick={handlePrintPdf}>
            Print / Save as PDF
          </button>
          <Link to="/" className="btn btn-outline-dark btn-sm">Choose Table</Link>
          <Link to="/chef" className="btn btn-dark btn-sm">Chef Dashboard</Link>
        </div>
      </div>

      <div className="row g-4 qr-grid">
        {tables.map((table) => {
          const url = `${window.location.origin}/table/${table}`;

          return (
            <div className="col-sm-6 col-md-4 col-xl-3 qr-card-col" key={table}>
              <div className="card shadow-sm border-0 h-100 p-3 text-center qr-card">
                <div className="mb-3 d-flex justify-content-center">
                  <QRCode value={url} size={150} bgColor="#ffffff" fgColor="#111111" />
                </div>
                <h3 className="h5 mb-1">Table {table}</h3>
                <p className="small text-muted mb-3 qr-url">{url}</p>
                <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark w-100">
                  Open Table {table}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .qr-print-header {
            display: none !important;
          }

          .qr-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(180px, 1fr)) !important;
            gap: 1.2rem !important;
          }

          .qr-card-col {
            width: 100% !important;
            max-width: none !important;
            flex: 0 0 auto !important;
          }

          .qr-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .qr-url {
            font-size: 10px !important;
          }

          .btn,
          a.btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TableQrCodes;
