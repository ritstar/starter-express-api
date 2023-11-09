const express = require('express');
const app = express();
const libre = require('libreoffice-convert');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const stream = require('stream');
require('dotenv').config();

console.log("Bucket=",process.env.CYCLIC_BUCKET_NAME);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const upload = multer();

app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const inputFileKey = req.file.originalname;
    const outputFileKey = `${path.parse(inputFileKey).name}.pdf`;

    const uploadParams = {
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: inputFileKey,
        Body: req.file.buffer
    };

    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error uploading file to S3');
        }

        const downloadParams = {
            Bucket: process.env.CYCLIC_BUCKET_NAME,
            Key: inputFileKey
        };

        s3.getObject(downloadParams, (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error downloading file from S3');
            }

            libre.convert(data.Body, '.pdf', undefined, (err, done) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error converting file');
                }

                const uploadConvertedParams = {
                    Bucket: process.env.CYCLIC_BUCKET_NAME,
                    Key: outputFileKey,
                    Body: done
                };

                s3.upload(uploadConvertedParams, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error uploading converted file to S3');
                    }

                    const downloadUrl = data.Location;
                    res.send({ downloadUrl: downloadUrl });
                });
            });
        });
    });
});

app.listen(process.env.PORT || 3000);