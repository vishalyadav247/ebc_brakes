import React, { useState, ChangeEvent } from 'react';
import { ContentHeader } from '@components';
import { Link } from 'react-router-dom';

interface FormData {
  make: string;
  model: string;
  yearStart: string;
  yearEnd: string;
  engineType: string;
  sku: string;
  carEnd: string;
  bhp: string;
  caliper: string;
  discDiameter: string;
  includedParts: string;
}

const initialFormData: FormData = {
  make: '',
  model: '',
  yearStart: '',
  yearEnd: '',
  engineType: '',
  sku: '',
  carEnd: '',
  bhp: '',
  caliper: '',
  discDiameter: '',
  includedParts: ''
};

export default function AddNewListCsvData() {
  const [formDataList, setFormDataList] = useState<FormData[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setFormDataList([...formDataList, formData]);
    setFormData(initialFormData);
  };

  return (
    <>
      <ContentHeader title="List CSV Data" />

      <div className='container-fluid'>
        <div className='row px-2'>
          <div className='col-lg-12'>
            <Link to="/list-csv-data">
              <i className="fa fa-arrow-left" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
        <div className='row px-2 mb-5'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Add New Data</h4>
            <div className='table-responsive'>
              <table className="table table-bordered">
                <tbody>
                  {Object.keys(initialFormData).map((key) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>
                        <input
                          className="form-control"
                          type="text"
                          name={key}
                          value={formData[key as keyof FormData]}
                          onChange={handleInputChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-dark mr-2" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
