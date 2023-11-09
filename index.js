const express = require('express');
const app = express();
const docxConverter = require('docx-pdf');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

console.log("Bucket=",process.env.CYCLIC_BUCKET_NAME);

const s3 = new AWS.S3(
//     {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// }
);

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

        const tempFilePath = path.join('/tmp', inputFileKey);

        const file = fs.createWriteStream(tempFilePath);

        s3.getObject(downloadParams).createReadStream().pipe(file);

        file.on('finish', () => {
            const outputFilePath = path.join('/tmp', outputFileKey);
        
            docxConverter(tempFilePath, outputFilePath, function(err, result){
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error converting file');
                }
        
                const uploadConvertedParams = {
                    Bucket: process.env.CYCLIC_BUCKET_NAME,
                    Key: outputFileKey,
                    Body: fs.createReadStream(outputFilePath)
                };

                s3.upload(uploadConvertedParams, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error uploading converted file to S3');
                    }
                
                    const urlParams = {
                        Bucket: process.env.CYCLIC_BUCKET_NAME,
                        Key: outputFileKey,
                        Expires: 60 * 5 // URL expires in 5 minutes
                    };
                
                    s3.getSignedUrl('getObject', urlParams, (err, url) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Error generating download URL');
                        }
                
                        res.send({ downloadUrl: url });
                    });
                });
                
            });
        });
    });
});

app.listen(process.env.PORT || 3000);