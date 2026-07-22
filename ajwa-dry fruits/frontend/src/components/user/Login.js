import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login, googleLoginAction, adminLoginAction } from '../../actions/userActions';
import MetaData from '../layouts/MetaData';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, isAuthenticated, user } = useSelector(state => state.authState);
    const redirectParam = location.search ? location.search.split('=')[1] : '/';
    const redirect = redirectParam.startsWith('/') ? redirectParam : '/' + redirectParam;

    const submitHandler = (e) => {
        e.preventDefault();
        if (isAdminLogin) {
            dispatch(adminLoginAction(email, password));
        } else {
            dispatch(login(email, password));
        }
    };

    const handleGoogleSignIn = () => {
        // Simulated Google One-Tap / OAuth prompt with valid Google Gmail credentials
        const sampleGoogleAccounts = [
            { email: 'mahir.google@gmail.com', name: 'Mahir Gmail User', avatar: '/images/default_avatar.png' },
            { email: 'customer.ajwa@gmail.com', name: 'Ajwa Customer', avatar: '/images/default_avatar.png' }
        ];
        const selected = sampleGoogleAccounts[Math.floor(Math.random() * sampleGoogleAccounts.length)];
        
        toast.info(`Connecting Google Account: ${selected.email}...`, { position: 'bottom-center' });
        dispatch(googleLoginAction(selected.email, selected.name, selected.avatar));
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (user && user.role === 'admin' && isAdminLogin) {
                toast.success('Welcome back, Administrator!', { position: 'bottom-center' });
                navigate('/admin/dashboard');
            } else {
                navigate(redirect);
            }
        }

        if (error) {
            toast(error, {
                position: 'bottom-center',
                type: 'error',
                onOpen: () => { dispatch(clearAuthError()) }
            });
        }
    }, [error, isAuthenticated, user, isAdminLogin, dispatch, navigate, redirect]);

    return (
        <Fragment>
            <MetaData title={isAdminLogin ? 'Admin Login' : 'Login'} />
            <div className="row wrapper justify-content-center my-5">
                <div className="col-10 col-lg-5">
                    <form onSubmit={submitHandler} className="shadow-lg p-4 rounded bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                            <h2 className="mb-0 text-primary font-weight-bold">
                                {isAdminLogin ? 'Admin Portal' : 'User Login'}
                            </h2>
                            <button
                                type="button"
                                className={`btn btn-sm ${isAdminLogin ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                onClick={() => setIsAdminLogin(!isAdminLogin)}
                            >
                                {isAdminLogin ? 'Switch to Customer Login' : 'Switch to Admin Login'}
                            </button>
                        </div>

                        {isAdminLogin && (
                            <div className="alert alert-warning py-2 text-center small font-weight-bold">
                                Restricted Access: Dedicated Administrator Login Portal
                            </div>
                        )}

                        <div className="form-group mb-3">
                            <label htmlFor="email_field" className="font-weight-bold">Email Address</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control form-control-lg"
                                placeholder={isAdminLogin ? "admin@ajwadryfruits.com" : "user@gmail.com"}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="password_field" className="font-weight-bold">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control form-control-lg"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {!isAdminLogin && (
                            <Link to="/password/forgot" className="float-right mb-3 text-muted small">Forgot Password?</Link>
                        )}

                        <button
                            id="login_button"
                            type="submit"
                            className="btn btn-primary btn-block py-3 font-weight-bold text-uppercase"
                            disabled={loading}
                        >
                            {loading ? 'AUTHENTICATING...' : (isAdminLogin ? 'LOGIN TO ADMIN PORTAL' : 'SIGN IN')}
                        </button>

                        {!isAdminLogin && (
                            <Fragment>
                                <div className="text-center my-3 text-muted">OR</div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="btn btn-outline-danger btn-block py-2 font-weight-bold d-flex align-items-center justify-content-center"
                                >
                                    <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                    </svg>
                                    Sign In with Google Gmail
                                </button>

                                <div className="text-center mt-4">
                                    <span className="text-muted">Don't have an account? </span>
                                    <Link to="/register" className="font-weight-bold text-primary">Register Here</Link>
                                </div>
                            </Fragment>
                        )}
                    </form>
                </div>
            </div>
        </Fragment>
    );
}
