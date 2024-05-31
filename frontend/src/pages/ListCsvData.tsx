import React, { useState, useEffect } from 'react';
import { ContentHeader } from '@components';
import { Link } from 'react-router-dom';

// Define types for local data
interface LocalData {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engineType: string;
  sku: string;
}

export default function ListCsvData() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [data, setData] = useState<LocalData[]>([
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
    { make: 'Abarth', model: '124', yearStart: 2010, yearEnd: 2015, engineType: '1.4 Turbo Petrol', sku: 'D125478' },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showPagination = data.length > itemsPerPage;

  return (
    <>
      <ContentHeader title="List CSV Data" />
      <div className="container-fluid">
        <div className="col-lg-12 px-2 mb-5">
          <div className="row">
            <div className="col-lg-8 mb-4">
              <h4 className="mb-3">Data Listing</h4>
              <Link to="/add-new-list-data"><button className="btn btn-dark mr-2">Add New Data</button></Link>
            </div>
            <div className="col-lg-4">
              <input className="form-control mb-4" placeholder="Search by Make and Model" />
            </div>
            <div className="col-lg-12">
              <div className='table-responsive'>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Make</th>
                      <th>Model</th>
                      <th>Year Start</th>
                      <th>Year End</th>
                      <th>Engine Type</th>
                      <th>SKU</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.make}</td>
                        <td>{item.model}</td>
                        <td>{item.yearStart}</td>
                        <td>{item.yearEnd}</td>
                        <td>{item.engineType}</td>
                        <td>{item.sku}</td>
                        <td>
                          <Link className="view-link" to="/view-link">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showPagination && (
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handlePrevPage}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handleNextPage}>
                      Next
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
