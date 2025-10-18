const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingPartner = require('../models/ShippingPartner');

// Create Order 
const createOrder = async (req, res) => {
    try {
        const { products } = req.body;

        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Products array is required' });
        }

        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return res.status(400).json({ error: 'Each product must have a valid product id and quantity >= 1' });
            }
        }

        // Fetch and verify products
        const productIds = [...new Set(products.map(p => p.product))];
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        if (dbProducts.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products not found' });
        }

        // Calculate total
        let totalPrice = 0;
        const orderProducts = products.map(item => {
            const dbp = dbProducts.find(p => p._id.toString() === item.product.toString());
            totalPrice += (dbp.price || 0) * item.quantity;
            return { product: item.product, quantity: item.quantity };
        });

        // Reduce stock for each product
        for (const item of products) {
            const dbProduct = dbProducts.find(p => p._id.toString() === item.product.toString());
            if (dbProduct.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${dbProduct.name}` });
            }
            dbProduct.stock -= item.quantity;
            await dbProduct.save();
        }

        // User cannot set shipping partner; admin/pharma can assign later
        const order = new Order({
            user: req.user._id,
            products: orderProducts,
            totalPrice,
            shippingPartner: null,
            paymentStatus: 'Pending'
        });

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('products.product', 'name price category')
            .populate('shippingPartner', 'name phone');

        res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Order
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Only admin/pharmacist can assign or change shipping partner
        if (req.body.shippingPartner) {
            if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
                return res.status(403).json({ error: 'Only admin or pharmacist can assign shipping partner' });
            }
            const partner = await ShippingPartner.findById(req.body.shippingPartner);
            if (!partner) return res.status(400).json({ error: 'Invalid shipping partner' });
            order.shippingPartner = partner._id;
        }

        // Status updates (admin/pharmacist or order owner)
        if (req.body.status) {
            if (req.user.role === 'admin' || req.user.role === 'pharmacist' || order.user.toString() === req.user._id.toString()) {
                order.status = req.body.status;
            }
        }

        const updated = await order.save();
        const populated = await Order.findById(updated._id)
            .populate('user', 'name email')
            .populate('products.product', 'name price')
            .populate('shippingPartner', 'name phone');

        res.json({ message: 'Order updated successfully', order: populated });
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get Single Order 
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product', 'name price')
            .populate('shippingPartner', 'name phone');

        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel Order
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (req.user.role === 'user' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only cancel if not already processed
        if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ error: 'Cannot cancel this order' });
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = {
    createOrder,
    getOrderById,
    updateOrder,
    cancelOrder
};
