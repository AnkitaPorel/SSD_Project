const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const metaRoutes = require('./routes/metaroutes');
const elitoolRoutes = require('./routes/elitool');

const app = express();
const PORT = process.env.PORT || 5001;
dotenv.config({ path: './config.env' });

const mongoUri = process.env.DATABASE_CONNECTION_STRING || "mongodb://localhost:27017/ellibot";

// Connect to MongoDB
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

const mongoDBstore = new MongoDBStore({
    uri: mongoUri,
    collection: 'localSessions',
});

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//SESSIONS HANDLER
const MAX_AGE = 1000 * 60 * 60 * 3 // 3hrs
app.use(
    session({
        secret: 'DUB_NATION',
        name: 'session-id', // cookies name to be put in "key" field in postman
        store: mongoDBstore,
        cookie: {
            maxAge: MAX_AGE, // this is when our cookies will expired and the session will not be valid anymore (user will be log out)
            secure: false,
        },
        resave: false,
        saveUninitialized: false,
    })
)

app.use('/api', userRoutes);
app.use('/api', metaRoutes);
app.use('/api', elitoolRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;