const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');
const bodyParser = require('body-parser');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Cloudinary
app.post('/api/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const file = req.files.image;

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'GenGlow',
        });

        // Safely remove temp file
        if (fs.existsSync(file.tempFilePath)) {
            fs.unlinkSync(file.tempFilePath);
        }

        res.status(200).json({
            message: 'Upload successful',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ error: 'Image upload failed', details: error.message });
    }
});


app.post('/saveData', (req, res) => {
    res.send(`Received data: ${JSON.stringify(req.body)}`);
});


// Route Imports
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
const adminRoutes = require('./routes/admins');
const pharmacistRoutes = require('./routes/pharmacists');


// Api Routes 
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
app.use('/api/admins', adminRoutes);
app.use('/api/pharmacists', pharmacistRoutes);


// Test Routes
app.get('/', (req, res) => res.send('GenGlow backend is running!'));
app.get('/api/test', (req, res) => res.json({ message: 'API is working!' }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
