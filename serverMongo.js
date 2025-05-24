require('dotenv').config();
const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || '3000';
app.set('port', port);
const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const storageRoutes = require('./routes/storage')

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));

app.use('/users', userRoutes); // POST /register | POST /login
app.use('/storage', storageRoutes);    
app.use('/auth', authRoutes); // POST /login

server.listen(port, () => {
  console.log('listening on port: '+ port);
})