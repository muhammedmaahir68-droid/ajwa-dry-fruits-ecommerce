import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../actions/userActions';
import { toast } from 'react-toastify';

export default function Profile() {
    const { user } = useSelector(state => state.authState);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = () => {
        dispatch(logout);
        toast.success('Logged out successfully!', { position: 'bottom-center' });
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="row justify-content-around mt-5 user-info">
            <div className="col-12 col-md-3">
                <figure className='avatar avatar-profile'>
                    <img className="rounded-circle img-fluid" src={user.avatar ?? '/images/default_avatar.png'} alt={user.name || 'User Profile'} />
                </figure>
                <Link to="/myprofile/update" id="edit_profile" className="btn btn-primary btn-block my-4 font-weight-bold">
                    Edit Profile
                </Link>
            </div>
    
            <div className="col-12 col-md-5">
                <h4>Full Name</h4>
                <p>{user.name}</p>
    
                <h4>Email Address</h4>
                <p>{user.email}</p>

                <h4>Joined</h4>
                <p>{user.createdAt ? String(user.createdAt).substring(0, 10) : 'N/A'}</p>

                <Link to="/orders" className="btn btn-danger btn-block mt-4 font-weight-bold">
                    My Orders
                </Link>

                <Link to="/myprofile/update/password" className="btn btn-primary btn-block mt-3 font-weight-bold">
                    Change Password
                </Link>

                {/* Logout button */}
                <button 
                    onClick={logoutHandler} 
                    className="btn btn-outline-danger btn-block mt-3 font-weight-bold py-2 shadow-sm"
                >
                    <i className="fa fa-sign-out mr-2"></i> Logout & Go to Login Page
                </button>
            </div>
        </div>
    );
}