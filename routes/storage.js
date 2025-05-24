const express = require('express');
const multer = require('multer');
const upload = multer(); 
const User = require('../models/User');
const { BlobServiceClient } = require('@azure/storage-blob');
const router = express.Router();


const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'user-profile-images';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);




async function deleteBlobByUrl(blobUrl) {
  const url = new URL(blobUrl);
  const [, containerName, ...blobParts] = url.pathname.split('/');
  const blobName = blobParts.join('/');
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const exists = await blockBlobClient.exists();
  
  if (exists) {
    await blockBlobClient.delete();
    console.log(`Deleted blob: ${blobUrl}`);
  } else {
    console.log(`Blob does not exist: ${blobUrl}`);
  }
}

router.post('/:type', upload.single('photo'), async (req, res) => {

  const { type } = req.params;
  const { username } = req.body;

  if (!req.file || !username) return res.status(400).send('Image and username required');

  try {
    const blobName = Date.now() + '-' + req.file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.size, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const imageUrl = blockBlobClient.url;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).send('User not found');

    if (type === 'profileImg') {
      user.profileImg = imageUrl;
    } else if (type === 'lodgingImg') {
      user.lodgingImg.push(imageUrl);
    } else {
      return res.status(400).send('Invalid type');
    }

    await user.save();
    res.json({ imageUrl, message: 'Image uploaded and saved to user' });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;

