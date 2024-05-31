import { ContentHeader } from '@components';

const Dashboard = () => {
  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner text-center">
                <p className='mt-3 mb-2'>Total shopify Products</p>
                  <h3>540</h3>
                </div>
                <div className="icon">
                  <i className="ion ion-bag" />
                </div>
 
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner text-center">
                <p className='mt-3 mb-2'>Total Make</p>
                  <h3> 177 </h3>
                </div>
                <div className="icon">
                  <i className="ion ion-stats-bars" />
                </div>
 
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner text-center">
                <p className='mt-3 mb-2'>Total Models</p>
                  <h3>240</h3>
                </div>
                <div className="icon">
                  <i className="ion ion-pie-graph" />
                </div>
 
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
