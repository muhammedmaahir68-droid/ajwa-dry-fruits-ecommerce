import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../actions/productActions";
import Loader from "./layouts/Loader";
import MetaData from "./layouts/MetaData";
import Product from "./product/Product";
import ChatbotWidget from "./ChatbotWidget";
import Ajwa3DHero from "./Ajwa3DHero";
import AdBanner from "./layouts/AdBanner";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';

const tabs = [
  'All Products', 
  'Dates', 
  'Almonds', 
  'Cashews', 
  'Walnuts', 
  'Pistachios', 
  'Dried Figs', 
  'Imported Chocolates', 
  'Gift Hampers'
];

function mapTabToCategory(tab) {
  if (tab === 'All Products') return null;
  return tab;
}

export default function Home() {
  const dispatch = useDispatch();
  const { products, loading, error, productsCount, resPerPage } = useSelector((state) => state.productsState);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All Products');

  const setCurrentPageNo = (pageNo) => {
    setCurrentPage(pageNo);
  };

  useEffect(() => {
    if (error) {
      return toast.error(error, {
        position: 'bottom-center'
      });
    }
    dispatch(getProducts(null, null, null, null, currentPage));
  }, [error, dispatch, currentPage]);

  const filteredProducts = useMemo(() => {
    const selectedCategory = mapTabToCategory(activeTab);
    if (!selectedCategory) return products || [];
    return (products || []).filter((product) => {
      const value = (product.category || '').toLowerCase();
      return value.includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(value);
    });
  }, [products, activeTab]);

  return (
    <Fragment>
      {loading ? <Loader /> : (
        <Fragment>
          <MetaData title={'Ajwa Dry Fruits & Gourmet Imported Chocolates'} />

          {/* Interactive 3D Cyber-Gold Hero Showcase */}
          <Ajwa3DHero />

          {/* Promotional Video & Countdown Ad Banner */}
          <AdBanner />

          {/* Category Filter Tabs */}
          <section className="ajwa-category-strip my-4 d-flex flex-wrap justify-content-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`btn btn-sm px-3 py-2 font-weight-bold rounded-pill shadow-sm transition-all ${activeTab === tab ? 'btn-warning text-dark font-weight-bold scale-105' : 'btn-outline-warning text-white'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </section>

          {/* Products Grid Showcase */}
          <section id="products" className="container-fluid ajwa-products-wrap my-4">
            <div className="row">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Product col={4} key={product._id} product={product} />
                ))
              ) : (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="fa fa-box-open fa-3x mb-3 text-warning"></i>
                  <h5>No items found in "{activeTab}". Select another category or view all products.</h5>
                </div>
              )}
            </div>
          </section>

          {/* Pagination */}
          {productsCount > 0 && productsCount > resPerPage ? (
            <div className="d-flex justify-content-center mt-4 mb-5">
              <Pagination
                activePage={currentPage}
                onChange={setCurrentPageNo}
                totalItemsCount={productsCount}
                itemsCountPerPage={resPerPage}
                nextPageText={'Next'}
                firstPageText={'First'}
                lastPageText={'Last'}
                itemClass={'page-item'}
                linkClass={'page-link'}
              />
            </div>
          ) : null}

          {/* AI Shopping Concierge Widget */}
          <ChatbotWidget products={products || []} />
        </Fragment>
      )}
    </Fragment>
  );
}
