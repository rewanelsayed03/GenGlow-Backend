const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');

dotenv.config();

const suppliers = [
    {
        name: 'Herbal Essence',
        email: 'contact@herbalessence.com',
        phone: '01012345678', address: 'Cairo, Egypt'
    },

    {
        name: 'Nature’s Best',
        email: 'info@naturesbest.com',
        phone: '01087654321',
        address: 'Alexandria, Egypt'
    },

    {
        name: 'Organic Roots',
        email: 'support@organicroots.com',
        phone: '01055555555',
        address: 'Giza, Egypt'
    }
];

const products = [
    {
        name: 'Herbal Acne Serum',
        description: 'Organic serum with tea tree oil and neem to reduce acne.',
        price: 200, stock: 50,
        category: 'Skin Care'
    },
    {
        name: 'Anti-Aging Herbal Cream',
        description: 'Rich cream with ginseng and collagen boosters.',
        price: 250, stock: 40,
        category: 'Skin Care'
    },
    {
        name: 'Hydrating Aloe Gel',
        description: 'Soothing aloe vera gel for dry skin.',
        price: 150, stock: 100,
        category: 'Skin Care'
    },
    {
        name: 'Brightening Vitamin C Cream',
        description: 'Herbal cream enriched with vitamin C for brighter skin.',
        price: 220,
        stock: 60,
        category: 'Skin Care'
    },
    {
        name: 'Herbal Dandruff Shampoo',
        description: 'Shampoo with neem & rosemary to fight dandruff.',
        price: 180,
        stock: 70,
        category: 'Hair Care'
    },
    {
        name: 'Strengthening Hibiscus Oil',
        description: 'Nourishing hibiscus oil to prevent hair fall.',
        price: 200,
        stock: 50,
        category: 'Hair Care'
    },
    {
        name: 'Moisturizing Argan Shampoo',
        description: 'Argan-infused shampoo for frizzy hair.',
        price: 190,
        stock: 80,
        category: 'Hair Care'
    },
    {
        name: 'Herbal Hair Growth Tonic',
        description: 'Ayurvedic tonic with bhringraj and amla.',
        price: 210,
        stock: 45,
        category: 'Hair Care'
    },
    {
        name: 'Rejuvenating Night Cream',
        description: 'Night cream with lavender & chamomile.',
        price: 230,
        stock: 60,
        category: 'Wellness'
    },
    {
        name: 'Detox Herbal Tea',
        description: 'Cleansing herbal tea blend for detox.',
        price: 120,
        stock: 90,
        category: 'Wellness'
    },
    {
        name: 'Relaxing Lavender Oil',
        description: 'Pure lavender essential oil to relieve stress.',
        price: 140,
        stock: 70,
        category: 'Wellness'
    },
    {
        name: 'Energizing Ginseng Blend',
        description: 'Herbal ginseng tea to boost energy.',
        price: 160,
        stock: 50,
        category: 'Wellness'
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear old data
        await Supplier.deleteMany();
        await Product.deleteMany();

        // Create suppliers
        const createdSuppliers = await Supplier.insertMany(suppliers);
        console.log('Suppliers seeded');

        // Assign products randomly to suppliers
        for (const item of products) {
            const randomSupplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
            const product = new Product({
                ...item,
                supplier: randomSupplier._id
            });
            await product.save();
            console.log(`Product seeded: ${product.name} | Supplier: ${randomSupplier.name}`);
        }

        console.log('All products seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
