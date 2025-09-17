const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('GenGlow backend is running!'));
app.get('/api/test', (req, res) => res.json({ message: 'API is working!' }));

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/quizResults', require('./routes/quizResults'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/examinations', require('./routes/examinations'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/shipping-partners', require('./routes/shippingPartners'));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
