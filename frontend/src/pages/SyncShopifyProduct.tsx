import { ContentHeader } from '@components';


export default function SyncShopifyProduct() {

  const productSave = async () => {
    try {
      await fetch('http://localhost:3000/save-products', {
        method: 'POST'
      });
      alert('All Shopify products sync'); 
  
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Failed to save products.');
    }
  }

  const productDelete = async () => {
    try {
      await fetch('http://localhost:3000/delete-all-products', {
        method: 'POST'
      });
      alert('All Shopify products Deleted'); 
  
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete products.'); // Display error message
    }
  }

  return (
    <>
      <ContentHeader title="Sync Shopify Product" />
      <div className="container-fluid">
        <div className='row px-2 mb-5 border py-4 rounded border-secondary'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Sync Shopify Products</h4>
            <button className=" btn btn-dark" onClick={productSave}>
              Sync Shopify Products
            </button>
          </div>
        </div>
        <div className='row px-2 mb-5 border py-4 rounded border-secondary'>
          <div className='col-lg-12'>
            <h4 className='mb-3'>Delete Products from Database Collection</h4>
            <button className=" btn btn-danger" onClick={productDelete}>
              Delete Products
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
