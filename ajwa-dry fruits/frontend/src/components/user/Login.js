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
            await axios.post('/api/v1/auth/verify-otp', { email, otp: otpCode });
            toast.success('OTP verified successfully! Logged in.', { position: 'bottom-center' });
            setTimeout(() => window.location.href = redirect, 500);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid or expired OTP code', { position: 'bottom-center' });
        }
    };

    // Official Google OAuth 2.0 Real Account Sign-In
    const handleGoogleSignIn = () => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '188853709078-41rdpiri4vq87f41ss4l52b3i0qsa9n1.apps.googleusercontent.com';
        const redirectUri = window.location.origin + '/login';
        const scope = 'openid email profile';
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
        
        window.location.href = googleAuthUrl;
    };

    // Extract real Google profile when Google redirects back with access_token
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
                toast.info('Verifying Google Account with Google Services...', { position: 'bottom-center' });
                axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`)
                    .then((res) => {
                        const { email: googleEmail, name: googleName, picture: googlePicture } = res.data;
                        if (googleEmail) {
                            dispatch(googleLoginAction(googleEmail, googleName || googleEmail.split('@')[0], googlePicture || '/images/default_avatar.png'));
                            window.history.replaceState(null, null, window.location.pathname);
                        }
                    })
                    .catch((err) => {
                        console.error('Google Userinfo Error:', err);
                        toast.error('Google sign-in verification failed. Please try again.', { position: 'bottom-center' });
                    });
            }
        }
    }, [dispatch]);

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
                                    Email OTP ??
                                </button>
                            </div>
                        </div>

                        {/* MODE 1: PASSWORD LOGIN */}
                        {loginMode === 'password' && (
                            <form onSubmit={submitHandler}>
                                <div className="form-group mb-3">
                                    <label htmlFor="email_field" className="font-weight-bold text-warning">Email Address</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control text-white bg-secondary border-warning"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="password_field" className="font-weight-bold text-warning">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control text-white bg-secondary border-warning"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="text-right mb-3">
                                    <Link to="/password/forgot" className="small text-warning">Forgot Password?</Link>
                                </div>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-warning btn-block font-weight-bold py-2 shadow-lg text-dark"
                                    disabled={loading}
                                >
                                    {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                                </button>
                            </form>
                        )}

                        {/* MODE 2: EMAIL OTP LOGIN */}
                        {loginMode === 'otp' && (
                            <div>
                                <div className="form-group mb-3">
                                    <label htmlFor="otp_email_field" className="font-weight-bold text-warning">Your Registered Email</label>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            id="otp_email_field"
                                            className="form-control text-white bg-secondary border-warning"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            disabled={otpSent}
                                        />
                                        <div className="input-group-append">
                                            <button
                                                type="button"
                                                className="btn btn-warning text-dark font-weight-bold"
                                                onClick={handleSendOTP}
                                                disabled={otpSending || !email}
                                            >
                                                {otpSending ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                                            </button>
                                        </div>
                                    </div>
                                    <small className="text-muted">A 6-digit passcode will be emailed to your inbox.</small>
                                </div>

                                {otpSent && (
                                    <form onSubmit={handleVerifyOTP} className="mt-4 pt-3 border-top border-secondary">
                                        <div className="form-group mb-3">
                                            <label htmlFor="otp_code_field" className="font-weight-bold text-warning">Enter 6-Digit Passcode</label>
                                            <input
                                                type="text"
                                                id="otp_code_field"
                                                className="form-control text-white text-center font-weight-bold bg-secondary border-warning letter-spacing-2"
                                                style={{ fontSize: '1.4rem' }}
                                                value={otpCode}
                                                maxLength="6"
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                placeholder="1 2 3 4 5 6"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-warning btn-block font-weight-bold py-2 text-dark shadow-lg"
                                        >
                                            VERIFY OTP & LOGIN
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* DIVIDER */}
                        <div className="d-flex align-items-center my-4 text-muted">
                            <hr className="flex-grow-1 border-secondary m-0" />
                            <span className="px-3 small font-weight-bold">OR</span>
                            <hr className="flex-grow-1 border-secondary m-0" />
                        </div>

                        {/* GOOGLE GMAIL OAUTH BUTTON */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="btn btn-warning btn-block font-weight-bold py-2 shadow-lg text-dark d-flex align-items-center justify-content-center gap-2"
                        >
                            <i className="fa fa-google text-danger mr-2"></i>
                            <span>Sign In with Google Gmail</span>
                        </button>

                        <div className="text-center mt-4">
                            <span className="small text-muted">Don't have an account? </span>
                            <Link to="/register" className="small text-warning font-weight-bold">Register Here</Link>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
