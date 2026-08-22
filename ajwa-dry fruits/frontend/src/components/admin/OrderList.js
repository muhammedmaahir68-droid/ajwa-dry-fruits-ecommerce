import { Fragment, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteOrder, adminOrders as adminOrdersAction } from "../../actions/orderActions";
import { clearError, clearOrderDeleted } from "../../slices/orderSlice";
import Loader from '../layouts/Loader';
import { MDBDataTable } from 'mdbreact';
import { toast } from 'react-toastify';
import Sidebar from "./Sidebar";

export default function OrderList() {
    const { adminOrders = [], loading = true, error, isOrderDeleted } = useSelector(state => state.orderState);

    const dispatch = useDispatch();

    const setOrders = () => {
        const data = {
            columns: [
                {
                    label: 'Order ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Items',
                    field: 'noOfItems',
                    sort: 'asc'
                },
                {
                    label: 'Amount',
                    field: 'amount',
                    sort: 'asc'
                },
                {
                    label: 'Payment Gateway',
                    field: 'paymentGateway',
                    sort: 'asc'
                },
                {
                    label: 'Status',
                    field: 'status',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                    sort: 'asc'
                }
            ],
            rows: []
        };

        adminOrders.forEach(order => {
            const paymentInfo = order.paymentInfo || {};
            const gatewayName = paymentInfo.gateway || (paymentInfo.id?.startsWith('pay_rzp') ? 'Razorpay' : paymentInfo.id?.startsWith('COD') ? 'Cash on Delivery' : 'Stripe/Online');
            
            data.rows.push({
                id: `#${order._id}`,
                noOfItems: (order.orderItems || []).length,
                amount: `₹${order.totalPrice}`,
                paymentGateway: (
                    <span className={`badge badge-${gatewayName === 'Razorpay' ? 'warning text-dark' : gatewayName === 'Cash on Delivery' ? 'info' : 'primary'}`}>
                        {gatewayName}
                    </span>
                ),
                status: (
                    <span className={`badge badge-${(order.orderStatus || '').includes('Processing') ? 'danger' : 'success'}`}>
                        {order.orderStatus || 'Processing'}
                    </span>
                ),
                actions: (
                    <Fragment>
                        <Link to={`/admin/order/${order._id}`} className="btn btn-primary btn-sm">
                            <i className="fa fa-pencil"></i>
                        </Link>
                        <Button onClick={e => deleteHandler(e, order._id)} className="btn btn-danger btn-sm ml-2">
                            <i className="fa fa-trash"></i>
                        </Button>
                    </Fragment>
                )
            });
        });

        return data;
    };

    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteOrder(id));
    };

    useEffect(() => {
        if (error) {
            toast(error, {
                position: 'bottom-center',
                type: 'error',
                onOpen: () => { dispatch(clearError()); }
            });
            return;
        }
        if (isOrderDeleted) {
            toast('Order Deleted Successfully!', {
                type: 'success',
                position: 'bottom-center',
                onOpen: () => dispatch(clearOrderDeleted())
            });
            return;
        }

        dispatch(adminOrdersAction);
    }, [dispatch, error, isOrderDeleted]);

    return (
        <div className="ajwa-admin-page">
            <Sidebar />
            <div className="ajwa-admin-content">
                <h2 className="ajwa-admin-title">
                    <i className="fa fa-shopping-bag mr-2"></i> Order Management
                </h2>
                <Fragment>
                    {loading ? <Loader /> :
                        <MDBDataTable
                            data={setOrders()}
                            bordered
                            striped
                            hover
                            className="ajwa-admin-table"
                        />
                    }
                </Fragment>
            </div>
        </div>
    );
}