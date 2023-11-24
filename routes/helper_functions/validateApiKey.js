require('dotenv').config();

module.exports = function validateApiKey(req, res, next) {
    try {
        const apiKey = req.headers['authorization'].split(' ')[1];
        if (apiKey !== process.env.BEARER_TOKEN) {
            return res.status(401).send({ 'error': 'Invalid API key' });
        }
        next();
    } catch (err) {
        return res.status(401).send({ 'error': 'Invalid API key' });
    }
}