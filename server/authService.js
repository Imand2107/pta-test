const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthService {
    constructor() {
        this.secretKey = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
        this.tokenExpiration = '24h';
    }

    generateToken(userId) {
        return jwt.sign({ userId }, this.secretKey, { expiresIn: this.tokenExpiration });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return null;
        }
    }

    validateConnection(token) {
        if (!token) return false;
        
        const decoded = this.verifyToken(token);
        return decoded && decoded.userId;
    }

    generateRefreshToken(userId) {
        return jwt.sign(
            { userId, type: 'refresh' },
            this.secretKey,
            { expiresIn: '7d' }
        );
    }

    refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, this.secretKey);
            if (decoded.type !== 'refresh') throw new Error('Invalid token type');
            
            return this.generateToken(decoded.userId);
        } catch (error) {
            console.error('Token refresh failed:', error.message);
            return null;
        }
    }

    revokeToken(token) {
        // In a real application, you would add the token to a blacklist
        // or remove it from a whitelist in your database
        console.log('Token revoked:', token);
    }
}

module.exports = new AuthService(); 