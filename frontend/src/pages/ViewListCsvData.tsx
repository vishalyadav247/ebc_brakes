import React, { useState } from 'react';
import { ContentHeader } from '@components';
import { Link } from 'react-router-dom';

interface DataItem {
  label: string;
  value: string;
}

export default function ViewListCsvData() {
  const initialData: DataItem[] = [
    { label: 'Make', value: 'Abarth' },
    { label: 'Model', value: '124' },
    { label: 'Year Start', value: '2010' },
    { label: 'Year End', value: '2015' },
    { label: 'Engine Type', value: '1.4 Turbo Petrol' },
    { label: 'SKU', value: 'D125478' },
    { label: 'Car End', value: '99' },
    { label: 'BHP', value: '170' },
    { label: 'Caliper', value: 'Brembo' },
    { label: 'Disc Diameter', value: '280mm' },
    { label: 'Included Parts', value: 'PD40K2617, D2033' },
  ];

  const [data, setData] = useState<DataItem[]>(initialData);
  const [editing, setEditing] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleInputChange = (label: string, value: string) => {
    const updatedInputValues = { ...inputValues, [label]: value };
    setInputValues(updatedInputValues);
    if (value === '') {
      const updatedData = data.map(item => ({
        ...item,
        value: item.label === label ? '' : item.value,
      }));
      setData(updatedData);
    }
  };
  

  const handleEditClick = () => {
    setEditing(true);
    const updatedInputValues: Record<string, string> = {};
    data.forEach(item => {
      updatedInputValues[item.label] = item.value;
    });
    setInputValues(updatedInputValues);
  };

  const handleUpdateClick = () => {
    const updatedData = data.map(item => ({
      ...item,
      value: inputValues[item.label] || item.value,
    }));
    setData(updatedData);
    setEditing(false);
  };

  return (
    <>
      <ContentHeader title="List CSV Data" />
      <div className='Container-fluid'>
        <div className='row px-2'>
          <div className='col-lg-12'>
            <Link to="/list-csv-data">
              <i className="fa fa-arrow-left" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
        <div className='row px-2 mb-5'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Data Listing</h4>
            <div className='table-responsive'>
            <table className="table table-bordered">
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <th>{item.label}</th>
                    {editing ? (
                      <td>
                        <input className='form-control'
                          type="text"
                          value={inputValues[item.label] || item.value}
                          onChange={(e) =>
                            handleInputChange(item.label, e.target.value)
                          }
                        />
                      </td>
                    ) : (
                      <td>{item.value}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {editing ? (
              <button className="btn btn-dark mr-2" onClick={handleUpdateClick}>
                Update
              </button>
            ) : (
              <button className="btn btn-info mr-2" onClick={handleEditClick}>
                Edit
              </button>
            )}
            <button className="btn btn-danger mr-2">Delete</button>
          </div>
        </div>
      </div>
    </>
  );
}
