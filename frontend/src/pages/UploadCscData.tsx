import React, { useState } from 'react';
import { ContentHeader } from '@components';

const UploadCscData: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        console.log('Selected file is not a CSV.');
        alert('Please select a CSV file.');
        setFile(null); // Reset the file state if not CSV
      }
    } else {
      console.log('No file selected');
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('http://localhost:3000/uploadCsv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        alert(result);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const deleteCsvData = async () => {
    try {
      await fetch('http://localhost:3000/delete-csv-products', {
        method: 'POST'
      });
      alert('CSV data deleted successfully');
    } catch (error) {
      console.error('Error in deleting Csv data', error);
      alert('Failed to delete Csv data.');
    }
  }

  return (
    <>
      <ContentHeader title="Upload CSV Data" />
      <div className="container-fluid">
        <div className='row px-2 mb-5 border py-4 rounded border-secondary'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Upload CSV Data</h4>
            <input type="file" onChange={handleFileChange} />
            <button className=" btn btn-primary" onClick={handleUpload}>Upload File</button>
            <br />
          </div>
        </div>
        <div className='row px-2 mb-5 border py-4 rounded border-secondary'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Delete Data from CSV</h4>
            <button className=" btn btn-primary" onClick={deleteCsvData}>
              Delete Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadCscData;
