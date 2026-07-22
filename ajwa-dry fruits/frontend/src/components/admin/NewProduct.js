import { Fragment, useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { createNewProduct } from "../../actions/productActions";
import { clearError, clearProductCreated } from "../../slices/productSlice";
import { toast } from "react-toastify";

export default function NewProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(1);
  const [offerPercentage, setOfferPercentage] = useState(0);
  const [salesStatus, setSalesStatus] = useState('Regular');
  const [seller, setSeller] = useState("Ajwa Dry Fruits");
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const imageInputRef = useRef(null);

  const { loading, isProductCreated, error } = useSelector((state) => state.productState);

  const categories = [
    'Dates',
    'Almonds',
    'Cashews',
    'Walnuts',
    'Pistachios',
    'Dried Figs',
    'Raisins',
    'Food'
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((oldArray) => [...oldArray, reader.result]);
          setImages((oldArray) => [...oldArray, file]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim() || !price || images.length === 0) {
      toast.error('Name, price and image are required', { position: 'bottom-center' });
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('offerPercentage', offerPercentage || 0);
    formData.append('salesStatus', salesStatus);
    formData.append('description', description || name);
    formData.append('seller', seller || 'Ajwa Dry Fruits');
    formData.append('category', category || 'Food');
    images.forEach((image) => {
      formData.append('images', image);
    });

    dispatch(createNewProduct(formData));
  };

  useEffect(() => {
    if (isProductCreated) {
      toast('Product Created Successfully!', {
        type: 'success',
        position: 'bottom-center',
        onOpen: () => dispatch(clearProductCreated())
      });
      navigate('/admin/products');
      return;
    }

    if (error) {
      toast(error, {
        position: 'bottom-center',
        type: 'error',
        onOpen: () => {
          dispatch(clearError());
        }
      });
    }
  }, [isProductCreated, error, dispatch, navigate]);

  return (
    <div className="row">
      <div className="col-12 col-md-2">
        <Sidebar />
      </div>
      <div className="col-12 col-md-10">
        <Fragment>
          <div className="wrapper my-5">
            <form onSubmit={submitHandler} className="shadow-lg" encType="multipart/form-data">
              <h1 className="mb-4">New Product</h1>

              <div className="form-group">
                <label htmlFor="name_field">Product Name</label>
                <input
                  type="text"
                  id="name_field"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder="e.g. Roasted Almonds (1kg)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price_field">Price</label>
                <input
                  type="number"
                  id="price_field"
                  className="form-control"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  placeholder="e.g. 749"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description_field">Description</label>
                <textarea
                  className="form-control"
                  id="description_field"
                  rows="4"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="category_field">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control" id="category_field">
                  <option value="">Select</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stock_field">Stock</label>
                <input
                  type="number"
                  id="stock_field"
                  className="form-control"
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="offer_field">Offer Percentage</label>
                <input
                  type="number"
                  id="offer_field"
                  className="form-control"
                  onChange={(e) => setOfferPercentage(e.target.value)}
                  value={offerPercentage}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sales_status_field">Sales Status</label>
                <select
                  value={salesStatus}
                  onChange={(e) => setSalesStatus(e.target.value)}
                  className="form-control"
                  id="sales_status_field"
                >
                  <option value="Regular">Regular</option>
                  <option value="On Sale">On Sale</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="seller_field">Seller Name</label>
                <input
                  type="text"
                  id="seller_field"
                  className="form-control"
                  onChange={(e) => setSeller(e.target.value)}
                  value={seller}
                />
              </div>

              <div className="form-group">
                <label className="d-block">Images</label>

                <input
                  ref={imageInputRef}
                  type="file"
                  name="product_images"
                  className="d-none"
                  id="customFile"
                  multiple
                  onChange={onImagesChange}
                  accept="image/*"
                />

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => imageInputRef.current && imageInputRef.current.click()}
                >
                  + Add Images
                </button>

                <div className="mt-3">
                  {imagesPreview.map((image) => (
                    <img
                      className="mr-2 mb-2"
                      key={image}
                      src={image}
                      alt="Preview"
                      width="72"
                      height="72"
                    />
                  ))}
                </div>
              </div>

              <button id="login_button" type="submit" disabled={loading} className="btn btn-block py-3">
                CREATE
              </button>
            </form>
          </div>
        </Fragment>
      </div>
    </div>
  );
}
