const express = require('express');
const multer = require('multer');
const upload = multer(); 
const User = require('../models/User');
const { BlobServiceClient } = require('@azure/storage-blob');
const router = express.Router();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

async function deleteBlobByUrl(blobUrl) {
  const url = new URL(blobUrl);
  const [, containerName, ...blobParts] = url.pathname.split('/');
  const blobName = blobParts.join('/');
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const exists = await blockBlobClient.exists();

  if (exists) {
    await blockBlobClient.delete();
    console.log(`Deleted blob: ${url}`);
  } 
  else {
    console.log(`Blob does not exist: ${url}`);
  }
}

router.post('/profileImg', upload.single('photo'), async (req, res) => {

  const { username } = req.body;
  if (!req.file || !username) return res.status(400).send('Image and username required');

  try {
    const blobName = Date.now() + '-' + req.file.originalname;
    const containerName = 'user-profile-images';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.size, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const imageUrl = blockBlobClient.url;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).send('User not found');
    user.profileImg = imageUrl;

    await user.save();
    res.json({ imageUrl, message: 'Image uploaded and saved to user' });
  } 
  catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Server error');
  }
});



router.post('/lodgeImg', upload.single('photo'), async (req, res) => {

  const { username } = req.body;
  if (!req.file || !username) return res.status(400).send('Image and username required');

  try {
    const blobName = Date.now() + '-' + req.file.originalname;
    const containerName = 'user-lodge-images';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.size, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const imageUrl = blockBlobClient.url;
    const user = await User.findOne({ username });
    user.lodgeImg.push(imageUrl)

    if (!user) return res.status(404).send('User not found');
    
    await user.save();
    res.json({ imageUrl, message: 'Image uploaded and saved to user' });

  } 
  catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Server error');
  }
});


router.post('/deleteImg', upload.none(), async (req, res) => { 
  const {username, blobUrl} = req.body
  deleteBlobByUrl(blobUrl)
  const user = await User.findOne({ username });
  user.lodgeImg = user.lodgeImg.filter((elem) => elem != blobUrl)
  await user.save();
  res.status(200)
})




module.exports = router;

