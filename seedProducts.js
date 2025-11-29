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
        description: 'This 100% organic herbal acne serum combines the powerful antibacterial properties of tea tree oil with the purifying effects of neem extract to cleanse pores deeply. It reduces inflammation, calms redness, and prevents future breakouts naturally. Suitable for all skin types, it leaves your complexion clear, smooth, and radiant.',
        price: 200, stock: 50,
        category: 'Skin Care'
    },
    {
        name: 'Anti-Aging Herbal Cream',
        description: 'Our anti-aging herbal cream is infused with ginseng, collagen boosters, and antioxidant-rich botanicals to fight fine lines and wrinkles. It nourishes the skin deeply, restores elasticity, and promotes a youthful glow. Ideal for nightly use, it hydrates, revitalizes, and leaves your skin feeling soft and rejuvenated.',
        price: 250, stock: 40,
        category: 'Skin Care'
    },
    {
        name: 'Hydrating Aloe Gel',
        description: 'This soothing aloe vera gel provides intense hydration while calming irritated or sunburned skin. Its lightweight, non-greasy formula absorbs quickly and restores moisture balance. Perfect for dry or sensitive skin, it promotes a refreshed, healthy, and radiant appearance.',
        price: 150, stock: 100,
        category: 'Skin Care'
    },
    {
        name: 'Brightening Vitamin C Cream',
        description: 'Brighten your skin with our herbal cream enriched with vitamin C and natural brightening extracts. It reduces dark spots, evens skin tone, and enhances your skin’s natural radiance. The cream also protects against environmental stressors while nourishing and revitalizing your complexion.',
        price: 220,
        stock: 60,
        category: 'Skin Care'
    },
    {
        name: 'Herbal Dandruff Shampoo',
        description: 'Our herbal dandruff shampoo is formulated with neem and rosemary to fight flakes, soothe itchiness, and restore scalp health naturally. Its gentle cleansing formula nourishes the hair while controlling excess oil and dryness. Regular use leaves hair soft, shiny, and dandruff-free.',
        price: 180,
        stock: 70,
        category: 'Hair Care'
    },
    {
        name: 'Strengthening Hibiscus Oil',
        description: 'Nourish and strengthen your hair with our herbal hibiscus oil, enriched with vitamins and botanicals that prevent breakage and promote healthy growth. It improves hair texture, adds shine, and reduces hair fall naturally. Suitable for all hair types, it enhances volume and vitality with regular use.',
        price: 200,
        stock: 50,
        category: 'Hair Care'
    },
    {
        name: 'Moisturizing Argan Shampoo',
        description: 'Our argan-infused herbal shampoo hydrates and repairs dry, frizzy hair while restoring softness and shine. Rich in antioxidants and essential fatty acids, it strengthens hair strands and improves manageability. Regular use leaves hair silky, smooth, and healthy-looking.',
        price: 190,
        stock: 80,
        category: 'Hair Care'
    },
    {
        name: 'Herbal Hair Growth Tonic',
        description: 'This Ayurvedic hair tonic combines bhringraj, amla, and natural herbs to stimulate scalp circulation and promote hair growth. It strengthens follicles, reduces thinning, and improves overall hair health. Perfect for all hair types, it encourages thicker, fuller, and more resilient hair naturally.',
        price: 210,
        stock: 45,
        category: 'Hair Care'
    },
    {
        name: 'Rejuvenating Night Cream',
        description: 'Our rejuvenating night cream is infused with lavender, chamomile, and herbal antioxidants to repair and restore your skin while you sleep. It reduces puffiness, deeply hydrates, and promotes a refreshed, radiant complexion. Wake up to softer, healthier, and revitalized skin every morning.',
        price: 230,
        stock: 60,
        category: 'Wellness'
    },
    {
        name: 'Detox Herbal Tea',
        description: 'Enjoy a cleansing cup of our detox herbal tea, crafted from a blend of natural detoxifying herbs that support digestion and flush out toxins. Its soothing aroma and gentle herbal ingredients promote overall wellness and vitality. Perfect for a daily detox ritual to maintain a healthy lifestyle.',
        price: 120,
        stock: 90,
        category: 'Wellness'
    },
    {
        name: 'Relaxing Lavender Oil',
        description: 'Pure lavender essential oil for aromatherapy and topical use, designed to reduce stress, promote relaxation, and improve sleep quality. Its calming scent helps relieve tension and anxiety.',
        price: 140,
        stock: 70,
        category: 'Wellness'
    },
    {
        name: 'Energizing Ginseng Blend',
        description: 'Herbal ginseng tea to naturally boost energy, enhance mental focus, and support the immune system. Blended with traditional herbs for a revitalizing daily drink that keeps you active and alert.',
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
