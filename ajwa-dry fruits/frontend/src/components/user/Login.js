import { Fragment, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login, googleLoginAction } from '../../actions/userActions';
import MetaData from '../layouts/MetaData';
import { toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [loginMode, setLoginMode] = useState('password');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpSending, setOtpSending] = useState(false);

    const dispatch = useDispatch();
    const location = useLocation();

    const { loading, error, isAuthenticated, user } = useSelector(state => state.authState);
    const redirectParam = location.search ? location.search.split('=')[1] : '/';
    const redirect = (redirectParam && redirectParam.startsWith('/')) ? redirectParam : '/';

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
            setTimeout(() => { window.location.href = redirect; }, 500);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid or expired OTP code', { position: 'bottom-center' });
        }
    };

    // Google Credential Handler (Decodes Google JWT Token directly)
    const handleGoogleCredentialResponse = useCallback((response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const { email: googleEmail, name: googleName, picture: googlePicture } = payload;

            if (googleEmail) {
                toast.success(`Welcome, ${googleName || googleEmail}! Logged in with Google.`, { position: 'bottom-center' });
                dispatch(googleLoginAction(googleEmail, googleName || googleEmail.split('@')[0], googlePicture || '/images/default_avatar.png'));
            }
        } catch (err) {
            console.error('Google JWT Error:', err);
            toast.error('Google Sign-In failed. Please try again.', { position: 'bottom-center' });
        }
    }, [dispatch]);

    // Load Google Identity Services SDK
    useEffect(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '188853709078-41rdpiri4vq87f41ss4l52b3i0qsa9n1.apps.googleusercontent.com';

        const initializeGoogle = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                    auto_select: false
                });

                const container = document.getElementById('googleSignInContainer');
                if (container) {
                    container.innerHTML = '';
                    window.google.accounts.id.renderButton(container, {
                        theme: 'filled_black',
                        size: 'large',
                        width: 320,
                        text: 'signin_with',
                        shape: 'pill'
                    });
                }
            }
        };

        if (window.google && window.google.accounts) {
            initializeGoogle();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogle;
            document.head.appendChild(script);
        }
    }, [handleGoogleCredentialResponse]);

    const handleCustomGoogleClick = () => {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt();
        } else {
            toast.info('Loading Google Identity Services...', { position: 'bottom-center' });
        }
    };

    // Auto Redirection on Authentication Success
    useEffect(() => {
        if (isAuthenticated) {
            if (user && user.role === 'admin') {
                toast.success('Welcome back, Administrator!', { position: 'bottom-center' });
                window.location.href = '/admin/dashboard';
            } else {
                toast.success('Logged in successfully!', { position: 'bottom-center' });
                window.location.href = redirect;
            }
        }

        if (error) {
            toast(error, {
                position: 'bottom-center',
                type: 'error',
                onOpen: () => { dispatch(clearAuthError()) }
            });
        }
    }, [error, isAuthenticated, user, dispatch, redirect]);

    return (
        <Fragment>
            <MetaData title="Login" />
            <div className="row wrapper justify-content-center my-5 px-2">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5">
                    <div className="shadow-lg p-4 rounded bg-dark text-white border border-warning">
                        
                        {/* Navigation Top Action — BACK TO STORE */}
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                            <Link to="/" className="btn btn-outline-warning btn-sm font-weight-bold d-flex align-items-center gap-1">
                                <i className="fa fa-arrow-left mr-1"></i> Back to Store
                            </Link>
                            <span className="small text-muted font-weight-bold">Ajwa Dry Fruits</span>
                        </div>

                        {/* Header Tabs */}
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-warning">
                            <h4 className="text-warning font-weight-bold m-0">
                                <i className="fa fa-user-circle mr-2"></i> Account Sign In
                            </h4>
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
                            <span className="px-3 small font-weight-bold">OR SIGN IN WITH GOOGLE</span>
                            <hr className="flex-grow-1 border-secondary m-0" />
                        </div>

                        {/* OFFICIAL GOOGLE IDENTITY SERVICES BUTTON */}
                        <div className="d-flex justify-content-center my-2">
                            <div id="googleSignInContainer"></div>
                        </div>

                        {/* CUSTOM GOOGLE FALLBACK BUTTON */}
                        <button
                            type="button"
                            onClick={handleCustomGoogleClick}
                            className="btn btn-warning btn-block font-weight-bold py-2 shadow-lg text-dark d-flex align-items-center justify-content-center gap-2 mt-2"
                        >
                            <i className="fa fa-google text-danger mr-2"></i>
                            <span>One-Tap Sign In with Google</span>
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
