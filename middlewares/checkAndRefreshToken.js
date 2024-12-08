const refreshAccessToken = require('../utils/tokenRefresh');

async function checkAndRefreshToken(req, res, next) {
    try {
        console.log('=== Token Refresh Debug ===');
        console.log('Request Body:', req.body);
        console.log('Request Headers:', req.headers);

        // Check if access token exists in request body
        if (!req.body.userId) {
            console.log('Error: No userId found in request body');
            return res.status(401).send('User ID is required');
        }

        const userId = req.body.userId;
        console.log('Attempting to refresh token for userId:', userId);

        const newAccessToken = await refreshAccessToken(userId);
        console.log('New access token generated:', newAccessToken ? 'Success' : 'Failed');

        req.body.accessToken = newAccessToken;
        console.log('Updated request body with new access token');
        
        next();
    } catch (error) {
        console.error('=== Token Refresh Error ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).send('Error refreshing access token');
    }
}

module.exports = checkAndRefreshToken;