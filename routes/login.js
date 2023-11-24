const express = require('express');
const validateApiKey = require('./helper_functions/validateApiKey');
const router = express.Router();
  
router.post('/', validateApiKey, async (req, res) => {
    const { username, password } = req.body;
    if (username === 'riteshjha0270@gmail.com' && password === 'admin') {
        req.session.username = username;
        res.status(200).json({
            message: 'Login Successful'
        });
    }
}
);

module.exports = router;