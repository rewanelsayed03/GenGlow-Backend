﻿const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, supplier } = req.body;

        // Validate supplier exists
        if (supplier) {
            const supplierExists = await Supplier.findById(supplier);
            if (!supplierExists) return res.status(400).json({ error: 'Supplier not found' });
        }

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Please upload an image' });
        }

        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'GenGlow/Products' });

        if (fs.existsSync(file.tempFilePath)) fs.unlinkSync(file.tempFilePath);

        const product = new Product({ name, description, price, stock, category, imageUrl: result.secure_url, supplier });
        await product.save();

        await product.populate('supplier', 'name _id'); 

        res.status(201).json({ message: 'Product created successfully', product });

    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name _id'); 
        res.json(products);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Get Single Product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier', 'name _id');
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json(product);
    } catch (error) {
        console.error('Get Product Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        if (updatedData.supplier) {
            const supplierExists = await Supplier.findById(updatedData.supplier);
            if (!supplierExists) return res.status(400).json({ error: 'Supplier not found' });
        }

        if (req.files && req.files.image) {
            const file = req.files.image;
            const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'GenGlow/Products' });
            updatedData.imageUrl = result.secure_url;
            if (fs.existsSync(file.tempFilePath)) fs.unlinkSync(file.tempFilePath);
        }

        let query = Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        query = query.populate('supplier', 'name _id'); 

        const product = await query;
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json({ message: 'Product updated successfully', product });

    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
