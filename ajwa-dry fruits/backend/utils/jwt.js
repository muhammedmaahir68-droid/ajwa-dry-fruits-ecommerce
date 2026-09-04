const { serializeUser } = require('./serialize');

const sendToken = (user, statusCode, res) => {

    //Creating JWT Token
    const token = user.getJwtToken();

    // Setting cross-site production secure cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
        expires: new Date(
            Date.now() + (Number(process.env.COOKIE_EXPIRES_TIME || 7) * 24 * 60 * 60 * 1000)
        ),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    };

    res.status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token,
        token_type: 'Bearer',
        session_mode: 'LIVE_AUTHENTICATED',
        user: serializeUser(user)
    });


}

module.exports = sendToken;
