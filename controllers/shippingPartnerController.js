const ShippingPartner = require('../models/ShippingPartner');
const Order = require('../models/Order');

// Create Shipping Partner
exports.createShippingPartner = async (req, res) => {
    try {
        const partner = new ShippingPartner(req.body);
        await partner.save();
        res.status(201).json({ message: 'Shipping Partner created', partner });
    } catch (error) {
        console.error('Create Shipping Partner Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Shipping Partners
exports.getAllShippingPartners = async (req, res) => {
    try {
        const partners = await ShippingPartner.find().populate('orders', 'status totalPrice');
        res.json(partners);
    } catch (error) {
        console.error('Get Shipping Partners Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Shipping Partner by ID
exports.getShippingPartnerById = async (req, res) => {
    try {
        const partner = await ShippingPartner.findById(req.params.id).populate('orders', 'status totalPrice');
        if (!partner) return res.status(404).json({ error: 'Shipping Partner not found' });
        res.json(partner);
    } catch (error) {
        console.error('Get Shipping Partner Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Shipping Partner
exports.updateShippingPartner = async (req, res) => {
    try {
        const partner = await ShippingPartner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!partner) return res.status(404).json({ error: 'Shipping Partner not found' });
        res.json({ message: 'Shipping Partner updated', partner });
    } catch (error) {
        console.error('Update Shipping Partner Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete Shipping Partner
exports.deleteShippingPartner = async (req, res) => {
    try {
        const partner = await ShippingPartner.findById(req.params.id);
        if (!partner) return res.status(404).json({ error: 'Shipping Partner not found' });

        // Unlink all orders from this shipping partner
        await Order.updateMany(
            { shippingPartner: partner._id },
            { $unset: { shippingPartner: "" } }
        );

        await ShippingPartner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shipping Partner deleted and orders unlinked' });
    } catch (error) {
        console.error('Delete Shipping Partner Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
