const express = require('express');
const app = express();
const libre = require('libreoffice-convert');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const S3FS = require('s3fs');
const fs = require('fs');
require('dotenv').config();

console.log("Buccket=",process.env.AWS_BUCKET_NAME);
const s3fsImpl = new S3FS(process.env.AWS_BUCKET_NAME, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const upload = multer({
    storage: multerS3({
        s3: s3fsImpl,
        bucket: process.env.AWS_BUCKET_NAME,
        key: function (req, file, cb) {
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});

app.post('/convert', upload.single('file'), (req, res) => {
    const inputFileKey = req.file.key;
    const outputFileKey = `${path.parse(inputFileKey).name}.pdf`;


    s3fsImpl.readFile(inputFileKey, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error getting file from S3');
        }

        const tempInputFile = path.join('/tmp', inputFileKey);
        const tempOutputFile = path.join('/tmp', outputFileKey);

        fs.writeFileSync(tempInputFile, data);

        libre.convert(tempInputFile, '.pdf', undefined, (err, done) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error converting file');
            }

            fs.writeFileSync(tempOutputFile, done);

            s3fsImpl.writeFile(outputFileKey, done, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error uploading file to S3');
                }

                const downloadUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${outputFileKey}`;
                res.send({ downloadUrl: downloadUrl });
            });
        });
    });
});

app.listen(process.env.PORT || 3000);