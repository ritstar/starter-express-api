const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Jimp = require('jimp');
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

const s3 = new AWS.S3();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image was uploaded.');
    }

    const format = req.query.format;
    if (!format) {
        return res.status(400).send('No format specified.');
    }

    try {
        const image = await Jimp.read(req.file.buffer);
        image.getBuffer(Jimp[`MIME_${format.toUpperCase()}`], async (err, buffer) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error converting image.');
            }

            const key = `${Date.now().toString()}.${format}`; // use a timestamp for unique file names

            const uploadParams = {
                Bucket: process.env.CYCLIC_BUCKET_NAME, // replace with your bucket name
                Key: key,
                Body: buffer,
                ACL: 'public-read' // this will make the uploaded file publicly readable
            };

            await s3.upload(uploadParams).promise();

            const urlParams = {
                Bucket: process.env.CYCLIC_BUCKET_NAME, // replace with your bucket name
                Key: key,
                Expires: 1800 // 30 minutes
            };

            const url = s3.getSignedUrl('getObject', urlParams);
            res.send({ url: url });

            // Schedule deletion of the image after 30 minutes
            setTimeout(async () => {
                try {
                    await s3.deleteObject({ Bucket: 'your-bucket-name', Key: key }).promise();
                    console.log(`Successfully deleted image ${key} from S3`);
                } catch (err) {
                    console.error(`Error deleting image ${key} from S3:`, err);
                }
            }, 30 * 60 * 1000); // 30 minutes
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error converting and uploading image.');
    }
});

module.exports = router;