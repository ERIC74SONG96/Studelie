const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // URL du client React
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/posts');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => res.send('API en ligne !'));

// Connexion MongoDB
const MONGO_URI = 'mongodb://localhost:27017/studelie';
const JWT_SECRET = 'votre_secret_jwt_super_securise';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => console.error('❌ Erreur MongoDB:', err));

// Définir JWT_SECRET globalement
process.env.JWT_SECRET = JWT_SECRET;

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`)); 