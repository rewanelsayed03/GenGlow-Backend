const Product = require('../models/Product');

// ====================== Create Product (Admin/Pharmacist only) ======================
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl, supplier } = req.body;

        const product = new Product({
            name,
            description,
            price,
            stock,
            category,
            imageUrl,
            supplier: supplier || null
        });

        await product.save();

        const populated = await Product.findById(product._id).populate('supplier', 'name phone address');
        res.status(201).json({ message: 'Product created', product: populated });
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Get All Products ======================
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name contactEmail phone');
        res.json(products);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Get Single Product ======================
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier', 'name contactEmail phone');
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Get Product Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Update Product (Admin/Pharmacist only) ======================
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier', 'name contactEmail phone');
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json({ message: 'Product updated', product });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Delete Product (Admin/Pharmacist only) ======================
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
