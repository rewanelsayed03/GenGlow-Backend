const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingPartner = require('../models/ShippingPartner');
const Payment = require('../models/Payment');

//  Create Order 
const createOrder = async (req, res) => {
    try {
        const { products, shippingPartner } = req.body;

        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Products array is required' });
        }

        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return res.status(400).json({ error: 'Each product must have product id and quantity >= 1' });
            }
        }

        // Fetch products from DB
        const productIds = [...new Set(products.map(p => p.product))];
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        if (dbProducts.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products not found' });
        }

        // Compute totalPrice 
        let totalPrice = 0;
        const orderProducts = products.map(item => {
            const dbp = dbProducts.find(p => p._id.toString() === item.product.toString());
            totalPrice += (dbp.price || 0) * item.quantity;
            return { product: item.product, quantity: item.quantity };
        });

        // Assign shipping partner (AdminS/pharmacist only)
        let partner = null;
        if (shippingPartner && (req.user.role === 'admin' || req.user.role === 'pharmacist')) {
            partner = shippingPartner;
        }

        const order = new Order({
            user: req.user._id,
            products: orderProducts,
            totalPrice,
            shippingPartner: partner
        });
        await order.save();

        // Handle payment 
        if (req.user.role === 'user') {
            const payment = new Payment({
                order: order._id,
                user: req.user._id,
                method: 'Cash On Delivery',
                amount: totalPrice,
                status: 'Pending'
            });
            await payment.save();

            order.paymentStatus = 'Pending';
            await order.save();
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('products.product', 'name price category')
            .populate('shippingPartner', 'name phone');

        res.status(201).json({ message: 'Order placed', order: populatedOrder });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


//  Get All Orders 
const getAllOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin' || req.user.role === 'pharmacist') {
            orders = await Order.find()
                .populate('user', 'name email')
                .populate('products.product', 'name price')
                .populate('shippingPartner', 'name phone');
        } else {
            orders = await Order.find({ user: req.user._id })
                .populate('user', 'name email')
                .populate('products.product', 'name price')
                .populate('shippingPartner', 'name phone');
        }
        res.json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Get Single Order 
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

//  Update Order 
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Users cannot update others' orders
        if (req.user.role === 'user' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Admin/Pharmacist can assign/change shipping partner
        if (req.body.shippingPartner && (req.user.role === 'admin' || req.user.role === 'pharmacist')) {
            const partner = await ShippingPartner.findById(req.body.shippingPartner);
            if (!partner) return res.status(400).json({ error: 'Invalid shipping partner' });
            order.shippingPartner = partner._id;
        }

        // Products update
        if (req.body.products) {
            if (req.user.role === 'user') {
                return res.status(403).json({ error: 'Users cannot change order products' });
            }

            const products = req.body.products;
            const productIds = [...new Set(products.map(p => p.product))];
            const dbProducts = await Product.find({ _id: { $in: productIds } });
            if (dbProducts.length !== productIds.length) {
                return res.status(400).json({ error: 'One or more products not found' });
            }

            let totalPrice = 0;
            const orderProducts = products.map(item => {
                const dbp = dbProducts.find(p => p._id.toString() === item.product.toString());
                const unitPrice = dbp.price || 0;
                totalPrice += unitPrice * item.quantity;
                return { product: item.product, quantity: item.quantity };
            });

            order.products = orderProducts;
            order.totalPrice = totalPrice;
        }

        // Status update
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

        res.json({ message: 'Order updated', order: populated });
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel Order (User or Admin)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (req.user.role === 'user' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only cancel if not already shipped or delivered
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


// Delete Order (Admin only)
const deleteOrder = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can delete orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    cancelOrder
};
