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

dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5001;
const mongoUri = process.env.DATABASE_CONNECTION_STRING || "mongodb://localhost:27017/ellibot";

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
        name: 'session-id',
        store: mongoDBstore,
        cookie: {
            maxAge: MAX_AGE,
            secure: false,
        },
        resave: false,
        saveUninitialized: false,
    })
);

// Routes
app.use('/api', userRoutes);
app.use('/api', metaRoutes);
app.use('/api', elitoolRoutes);

const isValidEnglishPhrase = (text) => {
    const regex = /^[A-Za-z0-9,.!?'" ]+$/;
    return regex.test(text) && text.trim().length > 0;
};

app.post('/api/validate-response', async (req, res) => {
    const { response } = req.body;
    try {
        if (!isValidEnglishPhrase(response)) {
            return res.status(400).json({
                isValid: false,
                message: "Response is not a valid English phrase. Please use proper words and punctuation."
            });
        }

        res.status(200).json({
            isValid: true,
            message: "The response is valid."
        });
    } catch (error) {
        console.error('Validation Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;