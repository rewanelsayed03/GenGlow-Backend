const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// ====================== Create Supplier ======================
exports.createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json({ message: 'Supplier created', supplier });
    } catch (error) {
        console.error('Create Supplier Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Get All Suppliers ======================
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();

        // For each supplier, fetch its products
        const suppliersWithProducts = await Promise.all(
            suppliers.map(async (supplier) => {
                const products = await Product.find({ supplier: supplier._id }).select('name price category');
                return { ...supplier.toObject(), products };
            })
        );

        res.json(suppliersWithProducts);
    } catch (error) {
        console.error('Get Suppliers Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Get Supplier by ID ======================
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        const products = await Product.find({ supplier: supplier._id }).select('name price category');
        res.json({ ...supplier.toObject(), products });
    } catch (error) {
        console.error('Get Supplier Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Update Supplier ======================
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        const products = await Product.find({ supplier: supplier._id }).select('name price category');
        res.json({ message: 'Supplier updated', supplier: { ...supplier.toObject(), products } });
    } catch (error) {
        console.error('Update Supplier Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ====================== Delete Supplier ======================
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

        // Unlink all products from this supplier
        await Product.updateMany(
            { supplier: supplier._id },
            { $unset: { supplier: "" } }
        );

        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supplier deleted and products unlinked' });
    } catch (error) {
        console.error('Delete Supplier Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
