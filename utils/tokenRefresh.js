const { google } = require('googleapis');
const User = require('../models/userModel');

async function refreshAccessToken(userId) {
    const user = await User.findById(userId);
    if (!user || !user.refreshToken) {
        throw new Error('User or refresh token not found');
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({ refresh_token: user.refreshToken });

    const { credentials } = await auth.refreshAccessToken();
    user.accessToken = credentials.access_token;
    await user.save();

    return user.accessToken;
}

module.exports = refreshAccessToken;