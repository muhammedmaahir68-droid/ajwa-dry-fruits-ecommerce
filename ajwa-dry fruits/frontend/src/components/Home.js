import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../actions/productActions";
import Loader from "./layouts/Loader";
import MetaData from "./layouts/MetaData";
import Product from "./product/Product";
import NetflixShelfRail from "./product/NetflixShelfRail";
import ChatbotWidget from "./ChatbotWidget";
import Ajwa3DHero from "./Ajwa3DHero";
import AdBanner from "./layouts/AdBanner";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';
import axios from 'axios';

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
  const { items: cartItems } = useSelector((state) => state.cartState);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All Products');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [allCatalogProducts, setAllCatalogProducts] = useState([]);

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

  // Load full catalog and AI Recommendations
  useEffect(() => {
    // 1. Fetch catalog for shelf rails
    axios.get('/api/v1/products?limit=50').then(res => {
      if (res.data && res.data.products) {
        setAllCatalogProducts(res.data.products);
      }
    }).catch(() => {});

    // 2. Fetch AI Recommendations from AI Microservice
    const cartIds = (cartItems || []).map(item => item.product || item.id || 1);
    axios.post('/api/v1/ai/recommend', {
      cartProductIds: cartIds,
      viewedCategories: ['Dates', 'Almonds', 'Pistachios'],
      topN: 6
    }).then(res => {
      if (res.data && res.data.recommendations) {
        setAiRecommendations(res.data.recommendations);
      }
    }).catch(() => {});
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    const selectedCategory = mapTabToCategory(activeTab);
    if (!selectedCategory) return products || [];
    return (products || []).filter((product) => {
      const value = (product.category || '').toLowerCase();
      return value.includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(value);
    });
  }, [products, activeTab]);

  // Derived Shelf Categories for Netflix Experience
  const trendingList = useMemo(() => {
    return (allCatalogProducts.length > 0 ? allCatalogProducts : products || [])
      .filter(p => Number(p.ratings || 0) >= 4.7 || (p.offerPercentage || 0) > 0);
  }, [allCatalogProducts, products]);

  const proteinList = useMemo(() => {
    return (allCatalogProducts.length > 0 ? allCatalogProducts : products || [])
      .filter(p => ['almonds', 'pistachios', 'cashews'].includes((p.category || '').toLowerCase()));
  }, [allCatalogProducts, products]);

  const datesExoticsList = useMemo(() => {
    return (allCatalogProducts.length > 0 ? allCatalogProducts : products || [])
      .filter(p => ['dates', 'dried figs', 'walnuts', 'gift hampers'].includes((p.category || '').toLowerCase()));
  }, [allCatalogProducts, products]);

  return (
    <Fragment>
      {loading ? <Loader /> : (
        <Fragment>
          <MetaData title={'Ajwa AI Commerce — AI-Powered Cloud-Native E-Commerce Platform'} />

          {/* Interactive 3D Cyber-Gold Hero Showcase */}
          <Ajwa3DHero />

          {/* Promotional Video & Countdown Ad Banner */}
          <AdBanner />

          {/* NETFLIX-STYLE STREAMING SHELVES ("Browse Like Netflix") */}
          <section className="ajwa-netflix-experience my-4">
            
            {/* Shelf 1: AI Recommended For You */}
            {aiRecommendations.length > 0 && (
              <NetflixShelfRail
                title="Recommended For You"
                subtitle="Personalized machine learning pairings based on your nutritional and flavor preferences"
                icon="fa-magic"
                badgeText="AI 2.0"
                products={aiRecommendations}
              />
            )}

            {/* Shelf 2: Trending Gourmet Superfoods */}
            <NetflixShelfRail
              title="Trending Now in Gourmet Fruits"
              subtitle="Top-rated single-origin harvests and customer favorite confections"
              icon="fa-fire"
              badgeText="POPULAR"
              products={trendingList.length > 0 ? trendingList : products}
            />

            {/* Shelf 3: High Protein & Gym Fuel */}
            <NetflixShelfRail
              title="High Protein & Workout Fuel"
              subtitle="Energy-dense whole almonds, Iranian pistachios, and rich cashews for muscle recovery"
              icon="fa-bolt"
              badgeText="FITNESS"
              products={proteinList.length > 0 ? proteinList : products}
            />

            {/* Shelf 4: Royal Saudi Dates & Exotic Curation */}
            <NetflixShelfRail
              title="Royal Saudi Ajwa & Exotic Superfoods"
              subtitle="Authentic Madinah Ajwa dates, Afghan sun-dried figs, and luxury festive gift hampers"
              icon="fa-moon-o"
              badgeText="EXCLUSIVE"
              products={datesExoticsList.length > 0 ? datesExoticsList : products}
            />

          </section>

          {/* Catalog Divider */}
          <div className="container-fluid px-4 my-4">
            <div className="d-flex align-items-center justify-content-between border-bottom border-warning pb-2">
              <h3 className="text-warning font-weight-bold m-0">
                <i className="fa fa-th-large mr-2"></i> Complete Gourmet Catalog
              </h3>
              <span className="text-muted small">Showing verified nitrogen-packed inventory</span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <section className="ajwa-category-strip my-3 d-flex flex-wrap justify-content-center gap-2">
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
                  <Product col={4} key={product._id || product.id} product={product} />
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
          <ChatbotWidget products={allCatalogProducts.length > 0 ? allCatalogProducts : products || []} />
        </Fragment>
      )}
    </Fragment>
  );
}
