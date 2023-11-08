const express = require('express');
const app = express();
const libre = require('libreoffice-convert');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), (req, res) => {
  const inputFile = path.join(__dirname, req.file.path);
  const outputFile = path.join(__dirname, 'output.pdf');

  console.log(`Input file path: ${inputFile}`);
  console.log(`Output file path: ${outputFile}`);

  libre.convert(inputFile, outputFile, (err) => {
    if (err) {
      return res.status(500).send('Error converting file');
    }

    res.send('File converted successfully!');
  });
});

app.listen(process.env.PORT || 3000);
