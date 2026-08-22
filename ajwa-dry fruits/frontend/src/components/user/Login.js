import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login, googleLoginAction } from '../../actions/userActions';
import MetaData from '../layouts/MetaData';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpSending, setOtpSending] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, isAuthenticated, user } = useSelector(state => state.authState);
    const redirectParam = location.search ? location.search.split('=')[1] : '/';
    const redirect = redirectParam.startsWith('/') ? redirectParam : '/' + redirectParam;

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(login(email, password));
    };

    const handleSendOTP = async () => {
        if (!email) {
            return toast.error('Please enter your email address to receive OTP', { position: 'bottom-center' });
        }
        try {
            setOtpSending(true);
            const { data } = await axios.post('/api/v1/auth/send-otp', { email });
            toast.success(data.message || 'OTP code sent to your email!', { position: 'bottom-center' });
            setOtpSent(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error sending OTP email', { position: 'bottom-center' });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!email || !otpCode) {
            return toast.error('Please enter your email and OTP code', { position: 'bottom-center' });
        }
        try {
            const { data } = await axios.post('/api/v1/auth/verify-otp', { email, otp: otpCode });
            toast.success('OTP verified successfully! Logged in.', { position: 'bottom-center' });
            setTimeout(() => window.location.href = redirect, 500);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid or expired OTP code', { position: 'bottom-center' });
        }
    };

    const handleGoogleSignIn = () => {
        const userEmail = prompt('Enter your Google Gmail address:', 'customer@gmail.com');
        if (!userEmail) return;

        const userName = userEmail.split('@')[0];
        toast.info(`Authenticating Google Account: ${userEmail}...`, { position: 'bottom-center' });
        dispatch(googleLoginAction(userEmail, userName, '/images/default_avatar.png'));
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (user && user.role === 'admin') {
                toast.success('Welcome back, Administrator!', { position: 'bottom-center' });
                navigate('/admin/dashboard');
            } else {
                toast.success('Logged in successfully!', { position: 'bottom-center' });
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
    }, [error, isAuthenticated, user, dispatch, navigate, redirect]);

    return (
        <Fragment>
            <MetaData title="Login" />
            <div className="row wrapper justify-content-center my-5 px-2">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5">
                    <div className="shadow-lg p-4 rounded bg-dark text-white border border-warning">
                        
                        {/* Header Tabs */}
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-warning">
                            <h3 className="text-warning font-weight-bold m-0">
                                <i className="fa fa-user-circle mr-2"></i> Account Sign In
                            </h3>
                            <div className="btn-group btn-group-sm">
                                <button
                                    type="button"
                                    className={`btn ${loginMode === 'password' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
                                    onClick={() => setLoginMode('password')}
                                >
                                    Password
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${loginMode === 'otp' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
                                    onClick={() => setLoginMode('otp')}
                                >
                                    Email OTP 🔑
                                </button>
                            </div>
                        </div>

                        {loginMode === 'password' ? (
                            <form onSubmit={submitHandler}>
                                <div className="form-group mb-3">
                                    <label htmlFor="email_field" className="font-weight-bold text-warning">Email Address</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control form-control-lg bg-secondary text-white border-warning"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="password_field" className="font-weight-bold text-warning">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control form-control-lg bg-secondary text-white border-warning"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Link to="/password/forgot" className="float-right mb-3 text-warning small">Forgot Password?</Link>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-warning btn-block py-3 font-weight-bold text-dark text-uppercase shadow w-100 mt-2"
                                    disabled={loading}
                                >
                                    {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP}>
                                <div className="form-group mb-3">
                                    <label className="font-weight-bold text-warning">Email Address</label>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-secondary text-white border-warning"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                        <div className="input-group-append">
                                            <button
                                                type="button"
                                                className="btn btn-warning font-weight-bold text-dark"
                                                onClick={handleSendOTP}
                                                disabled={otpSending}
                                            >
                                                {otpSending ? 'SENDING...' : 'SEND OTP'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {otpSent && (
                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold text-warning">6-Digit OTP Code</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-secondary text-warning font-weight-bold text-center letter-spacing-3"
                                            placeholder="123456"
                                            maxLength="6"
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value)}
                                            required
                                        />
                                        <small className="text-muted">Enter the 6-digit code sent to your email</small>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-warning btn-block py-3 font-weight-bold text-dark text-uppercase shadow w-100 mt-2"
                                    disabled={!otpSent}
                                >
                                    VERIFY & SIGN IN
                                </button>
                            </form>
                        )}

                        <div className="text-center my-3 text-muted">OR</div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="btn btn-outline-warning btn-block py-2 font-weight-bold d-flex align-items-center justify-content-center w-100"
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
                            <Link to="/register" className="font-weight-bold text-warning">Register Here</Link>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
