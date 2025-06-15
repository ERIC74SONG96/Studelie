const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Exemple route test
app.get('/', (req, res) => {
  res.send('API Studelie en ligne !');
});

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connecté');
}).catch((err) => {
  console.error('❌ Erreur MongoDB :', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`)); 