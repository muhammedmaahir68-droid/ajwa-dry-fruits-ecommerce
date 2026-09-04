import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../actions/productActions";
import Loader from "../layouts/Loader";
import MetaData from "../layouts/MetaData";
import Product from "../product/Product";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';
import { useParams, Link } from "react-router-dom";
import Slider from "rc-slider";
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

export default function ProductSearch() {
    const dispatch = useDispatch();
    const { products = [], loading, error, productsCount, resPerPage } = useSelector((state) => state.productsState);
    const [currentPage, setCurrentPage] = useState(1);
    const [price, setPrice] = useState([1, 2000]);
    const [priceChanged, setPriceChanged] = useState(price);
    const [category, setCategory] = useState(null);
    const [rating, setRating] = useState(0);

    const { keyword } = useParams();
    
    // Official Ajwa Dry Fruits Categories
    const categories = [
        'Dates',
        'Almonds',
        'Cashews',
        'Walnuts',
        'Pistachios',
        'Dried Figs',
        'Raisins',
        'Imported Chocolates',
        'Gift Hampers'
    ];

    const setCurrentPageNo = (pageNo) => {
        setCurrentPage(pageNo);
    };

    useEffect(() => {
        if (error) {
            return toast.error(error, {
                position: 'bottom-center'
            });
        }
        dispatch(getProducts(keyword, priceChanged, category, rating, currentPage));
    }, [error, dispatch, currentPage, keyword, priceChanged, category, rating]);

    return (
        <Fragment>
            {loading ? <Loader /> :
                <Fragment>
                    <MetaData title={'Buy Royal Dry Fruits & Dates - Ajwa Dry Fruits'} />
                    
                    <div className="d-flex justify-content-between align-items-center mt-4 mb-3 flex-wrap gap-2">
                        <div>
                            <h2 className="text-warning font-weight-bold m-0">
                                <i className="fa fa-search mr-2"></i> {keyword ? `Results for "${keyword}"` : 'Browse Royal Catalog'}
                            </h2>
                            <small className="text-muted">Single-origin royal harvests, gourmet imported chocolates & gift hampers</small>
                        </div>
                        {category && (
                            <button 
                                className="btn btn-sm btn-outline-warning text-warning"
                                onClick={() => setCategory(null)}
                            >
                                Clear Category: <strong>{category}</strong> &times;
                            </button>
                        )}
                    </div>

                    <section id="products" className="container-fluid mt-3">
                        <div className="row">
                            {/* Left Filters Column */}
                            <div className="col-12 col-md-3 mb-4">
                                <div className="p-3 rounded shadow" style={{ background: 'rgba(20, 10, 8, 0.95)', border: '1px solid rgba(229, 169, 60, 0.3)' }}>
                                    
                                    {/* Price Filter */}
                                    <h5 className="text-warning font-weight-bold mb-3">
                                        <i className="fa fa-tag mr-2"></i> Price Filter
                                    </h5>
                                    <div className="px-3" onMouseUp={() => setPriceChanged(price)} onTouchEnd={() => setPriceChanged(price)}>
                                        <Slider
                                            range={true}
                                            marks={{
                                                1: "₹1",
                                                2000: "₹2000"
                                            }}
                                            min={1}
                                            max={2000}
                                            defaultValue={price}
                                            onChange={(p) => setPrice(p)}
                                            handleRender={
                                                renderProps => (
                                                    <Tooltip overlay={`₹${renderProps.props['aria-valuenow']}`}>
                                                        <div {...renderProps.props}></div>
                                                    </Tooltip>
                                                )
                                            }
                                        />
                                    </div>

                                    <hr className="my-4 border-secondary" />

                                    {/* Category Filter */}
                                    <h5 className="text-warning font-weight-bold mb-3">
                                        <i className="fa fa-th-list mr-2"></i> Categories
                                    </h5>
                                    <div className="d-flex flex-column gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setCategory(null)}
                                            className={`btn btn-sm text-left py-2 px-3 rounded mb-1 font-weight-bold transition-all ${
                                                category === null 
                                                    ? 'btn-warning text-dark shadow' 
                                                    : 'btn-dark text-white border-0'
                                            }`}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            ✨ All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`btn btn-sm text-left py-2 px-3 rounded mb-1 transition-all ${
                                                    category === cat 
                                                        ? 'btn-warning text-dark font-weight-bold shadow' 
                                                        : 'btn-dark text-white border-0'
                                                }`}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                ● {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <hr className="my-4 border-secondary" />

                                    {/* Ratings Filter */}
                                    <h5 className="text-warning font-weight-bold mb-3">
                                        <i className="fa fa-star mr-2"></i> Minimum Rating
                                    </h5>
                                    <div className="d-flex flex-column gap-2 pl-1">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div
                                                key={star}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setRating(star)}
                                                className={`p-1 rounded d-flex align-items-center ${rating === star ? 'bg-warning text-dark' : ''}`}
                                            >
                                                <div className="rating-outer mr-2" style={{ fontSize: '0.85rem' }}>
                                                    <div
                                                        className="rating-inner"
                                                        style={{ width: `${star * 20}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`small ${rating === star ? 'text-dark font-weight-bold' : 'text-muted'}`}>
                                                    {star} Star & up
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>

                            {/* Right Products Grid */}
                            <div className="col-12 col-md-9">
                                {products.length === 0 ? (
                                    <div className="text-center p-5 rounded shadow" style={{ background: 'rgba(20, 10, 8, 0.85)', border: '1px solid rgba(229,169,60,0.3)' }}>
                                        <i className="fa fa-search text-warning fa-3x mb-3"></i>
                                        <h4 className="text-white font-weight-bold">No Products Found</h4>
                                        <p className="text-muted">Try adjusting your price range or category filter.</p>
                                        <button 
                                            onClick={() => { setCategory(null); setRating(0); setPrice([1, 2000]); setPriceChanged([1, 2000]); }}
                                            className="btn btn-warning text-dark font-weight-bold"
                                        >
                                            Reset All Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {products.map(product => (
                                            <Product col={4} key={product._id || product.id} product={product} />
                                        ))}
                                    </div>
                                )}

                                {productsCount > 0 && productsCount > resPerPage && (
                                    <div className="d-flex justify-content-center mt-5">
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
                                )}
                            </div>
                        </div>
                    </section>
                </Fragment>
            }
        </Fragment>
    );
}
