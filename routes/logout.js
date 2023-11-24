const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    // Delete the session
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      } else {
        res.status(200).json({ message: 'Logged out' });
      }
    });
})

module.exports = router;