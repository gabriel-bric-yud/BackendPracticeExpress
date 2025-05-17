const express = require('express');
const app = express();

const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || '3000';
app.set('port', port);

const cors = require('cors');
const multer = require('multer');
const upload = multer();

const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.connect('mongodb+srv://testUser:testUser@user-auth.twybtfq.mongodb.net/?retryWrites=true&w=majority&appName=user-auth')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));

app.use('/users', userRoutes);    // POST /register
app.use('/auth', authRoutes);         // POST /login


server.listen(port, () => {
  console.log('listening on port: '+ port);
})

