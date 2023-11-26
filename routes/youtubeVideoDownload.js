const express = require('express');
const ytdl = require('ytdl-core');
const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send({ 'error': 'No url was provided.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        res.send({ url: format.url, formats: info.formats, title: info.videoDetails.title, thumbnail: info.videoDetails.thumbnails[0].url, description: info.videoDetails.description, author: info.videoDetails.author.name, authorUrl: info.videoDetails.author.user_url });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving video download url.');
    }
});

module.exports = router;