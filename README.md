# Express.js API for Image Conversion
This is an Express.js API that allows you to convert any image format like png/jpg/svg to any other format. The API is built using Node.js and uses the Sharp library for image processing.

# Installation
1. Clone this repository.
2. Install the dependencies using ```npm install```.

# Usage
1. Start the server using ```npm start```.
2. Send a POST request to  ```http://localhost:3000/convert``` with the following parameters:
```file``` : The image file to be converted.
```format``` : The target format of the converted image.

# Example
```javascript
const axios = require('axios');
const fs = require('fs');

const file = fs.readFileSync('path/to/image.png');
const format = 'webp';

axios.post('http://localhost:3000/convert', {
  file,
  format
})
.then((response) => {
  console.log(response.data);
})
.catch((error) => {
  console.error(error);
});
```