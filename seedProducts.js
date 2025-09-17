const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
    // Skin Care
    {
        name: 'Herbal Acne Serum',
        description: 'Organic serum with tea tree oil and neem to reduce acne and blemishes.',
        price: 200,
        stock: 50,
        category: 'Skin Care',
        imageUrl: 'https://example.com/acne-serum.jpg'
    },
    {
        name: 'Anti-Aging Herbal Cream',
        description: 'Rich cream with ginseng and collagen boosters to reduce wrinkles.',
        price: 250,
        stock: 40,
        category: 'Skin Care',
        imageUrl: 'https://example.com/anti-aging.jpg'
    },
    {
        name: 'Hydrating Aloe Gel',
        description: 'Soothing aloe vera gel for dry or irritated skin.',
        price: 150,
        stock: 100,
        category: 'Skin Care',
        imageUrl: 'https://example.com/aloe-gel.jpg'
    },
    {
        name: 'Brightening Vitamin C Cream',
        description: 'Herbal cream enriched with vitamin C for brighter, even-toned skin.',
        price: 220,
        stock: 60,
        category: 'Skin Care',
        imageUrl: 'https://example.com/vitamin-c.jpg'
    },

    //  Hair Care
    {
        name: 'Herbal Dandruff Shampoo',
        description: 'Shampoo with neem & rosemary to fight dandruff and itchy scalp.',
        price: 180,
        stock: 70,
        category: 'Hair Care',
        imageUrl: 'https://example.com/dandruff-shampoo.jpg'
    },
    {
        name: 'Strengthening Hibiscus Oil',
        description: 'Nourishing hibiscus oil that prevents hair fall and strengthens roots.',
        price: 200,
        stock: 50,
        category: 'Hair Care',
        imageUrl: 'https://example.com/hibiscus-oil.jpg'
    },
    {
        name: 'Moisturizing Argan Shampoo',
        description: 'Argan-infused shampoo for frizzy and dry hair.',
        price: 190,
        stock: 80,
        category: 'Hair Care',
        imageUrl: 'https://example.com/argan-shampoo.jpg'
    },
    {
        name: 'Herbal Hair Growth Tonic',
        description: 'Ayurvedic tonic with bhringraj and amla to boost hair growth.',
        price: 210,
        stock: 45,
        category: 'Hair Care',
        imageUrl: 'https://example.com/hair-tonic.jpg'
    },

    //  Lifestyle & Wellness
    {
        name: 'Rejuvenating Night Cream',
        description: 'Night cream with lavender & chamomile to repair skin overnight.',
        price: 230,
        stock: 60,
        category: 'Wellness',
        imageUrl: 'https://example.com/night-cream.jpg'
    },
    {
        name: 'Detox Herbal Tea',
        description: 'Cleansing herbal tea blend for detox and digestion support.',
        price: 120,
        stock: 90,
        category: 'Wellness',
        imageUrl: 'https://example.com/detox-tea.jpg'
    },
    {
        name: 'Relaxing Lavender Oil',
        description: 'Pure lavender essential oil to relieve stress and promote sleep.',
        price: 140,
        stock: 70,
        category: 'Wellness',
        imageUrl: 'https://example.com/lavender-oil.jpg'
    },
    {
        name: 'Energizing Ginseng Blend',
        description: 'Herbal ginseng tea to boost energy and reduce fatigue.',
        price: 160,
        stock: 50,
        category: 'Wellness',
        imageUrl: 'https://example.com/ginseng-blend.jpg'
    },

    //  Bonus Products
    {
        name: 'Herbal Sun Protection Cream',
        description: 'Natural SPF cream with aloe and zinc oxide for UV protection.',
        price: 180,
        stock: 60,
        category: 'Skin Care',
        imageUrl: 'https://example.com/sun-protection.jpg'
    },
    {
        name: 'Anti-Pollution Face Mist',
        description: 'Face mist with green tea and vitamin E for pollution defense.',
        price: 170,
        stock: 75,
        category: 'Skin Care',
        imageUrl: 'https://example.com/face-mist.jpg'
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Product.deleteMany(); 
        await Product.insertMany(products);
        console.log('Products seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
