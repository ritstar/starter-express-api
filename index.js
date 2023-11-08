const express = require('express');
const app = express();
const libre = require('libreoffice-convert');
const path = require('path');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: function (req, file, cb) {
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});

app.post('/convert', upload.single('file'), (req, res) => {
    const inputFileKey = req.file.key;
    const outputFileKey = `${path.parse(inputFileKey).name}.pdf`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: inputFileKey
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error getting file from S3');
        }

        const tempInputFile = path.join('/tmp', inputFileKey);
        const tempOutputFile = path.join('/tmp', outputFileKey);

        fs.writeFileSync(tempInputFile, data.Body);

        libre.convert(tempInputFile, '.pdf', undefined, (err, done) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error converting file');
            }

            fs.writeFileSync(tempOutputFile, done);

            s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: outputFileKey,
                Body: fs.createReadStream(tempOutputFile)
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error uploading file to S3');
                }

                res.send({ downloadUrl: data.Location });
            });
        });
    });
});

app.listen(process.env.PORT || 3000);