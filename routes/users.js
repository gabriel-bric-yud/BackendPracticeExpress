const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer(); 
const User = require('../models/User');
const { BlobServiceClient } = require('@azure/storage-blob');

const router = express.Router();


router.post('/register', upload.none(), async (req, res) => {
  const { username, password, bio, profileImg} = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, hashedPassword, bio, profileImg});

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

router.post('/login', upload.none(), async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
});


const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'user-profile-images';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

router.post('/photo/:type', upload.single('photo'), async (req, res) => {

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
      user.lodgingImgs.push(imageUrl);
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


router.get('/:username', async (req, res) => {
  const { username } = req.params; // Get id from URL

  try {
    const user = await User.findOne({ username }); // User.findById(id); or findOne({ _id: id })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err.message });
  }
});

module.exports = router;

