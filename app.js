
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require ('express-session');
const cookieParser = require('cookie-parser');
var flash = require('connect-flash');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const path = require('path');

const app = express();

dotenv.config();

mongoose.connect(process.env.URI_DB);

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to the database:', error.message);
});

db.once('open', () => {
  console.log('Connection to the database successful!');
});

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({ 
  secret: 'secret-key', 
  resave: true, 
  cookie: { maxAge: oneDay },
  saveUninitialized: true 
}));
app.use(flash());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', userRoute);
app.use('/admin', adminRoute);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
