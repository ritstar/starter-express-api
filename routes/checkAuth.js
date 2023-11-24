const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.username) {
      res.status(200).json({ message: 'Logged in' });
    } else {
      res.status(401).json({ message: 'Not logged in' });
    }
  });

module.exports = router;