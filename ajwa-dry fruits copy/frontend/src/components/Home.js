import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../actions/productActions";
import Loader from "./layouts/Loader";
import MetaData from "./layouts/MetaData";
import Product from "./product/Product";
import ChatbotWidget from "./ChatbotWidget";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';

const tabs = ['New Arrivals', 'Dates', 'Almonds', 'Cashews', 'Walews', 'Pistachios', 'Dried Figs'];

function mapTabToCategory(tab) {
  if (tab === 'New Arrivals') return null;
  if (tab === 'Walews') return 'Walnuts';
  return tab;
}

export default function Home() {
  const dispatch = useDispatch();
  const { products, loading, error, productsCount, resPerPage } = useSelector((state) => state.productsState);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('New Arrivals');

  const setCurrentPageNo = (pageNo) => {
    setCurrentPage(pageNo);
  };

  useEffect(() => {
    if (error) {
      return toast.error(error, {
        position: toast.POSITION.BOTTOM_CENTER
      });
    }
    dispatch(getProducts(null, null, null, null, currentPage));
  }, [error, dispatch, currentPage]);

  const filteredProducts = useMemo(() => {
    const selectedCategory = mapTabToCategory(activeTab);
    if (!selectedCategory) return products || [];
    return (products || []).filter((product) => {
      const value = (product.category || '').toLowerCase();
      return value === selectedCategory.toLowerCase();
    });
  }, [products, activeTab]);

  return (
    <Fragment>
      {loading ? <Loader /> : (
        <Fragment>
          <MetaData title={'Ajwa Dry Fruits'} />

          <section className="ajwa-category-strip">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`ajwa-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </section>

          <section id="products" className="container-fluid ajwa-products-wrap">
            <div className="row">
              {filteredProducts && filteredProducts.map((product) => (
                <Product col={4} key={product._id} product={product} />
              ))}
            </div>
          </section>

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
          <ChatbotWidget products={products || []} />
        </Fragment>
      )}
    </Fragment>
  );
}
