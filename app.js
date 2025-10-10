const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const sampleRequestRoutes = require('./routes/sampleRequests');
const orderRoutes = require('./routes/orders');
const quizResultRoutes = require('./routes/quizResults');
const reviewRoutes = require('./routes/reviews');
const examinationRoutes = require('./routes/examinations');
const supplierRoutes = require('./routes/suppliers');
const shippingPartnerRoutes = require('./routes/shippingPartners');
const paymentRoutes = require('./routes/payments');


const app = express();
app.use(cors());
app.use(express.json());

// Test 
app.get('/', (req, res) => res.send('GenGlow backend is running!'));
app.get('/api/test', (req, res) => res.json({ message: 'API is working!' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/samplerequests', sampleRequestRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quizResults', quizResultRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/shipping-partners', shippingPartnerRoutes);
app.use('/api/payments', paymentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
