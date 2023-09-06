const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    const { orderedItems, username } = req.body;
    try {
        const order = new Order({ orderedItems, username });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $match: {
                    isOrdered: true // consider only orders that have been placed
                }
            },
            {
                $group: {
                    _id: "$username",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}


exports.addToCart = async (req, res) => {
    const { petItemId } = req.body;
    const { username } = req.session;  // Retrieve the username from the session
    try {
        let order = await Order.findOne({ username, isOrdered: false });
        if (!order) {
            order = new Order({ username, orderedItems: [petItemId] });
        } else {
            order.orderedItems.push(petItemId);
        }
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}
exports.orderPlaced = async (req, res) => {
    try {
        let order = await Order.findById(req.params.orderId).populate('orderedItems');
        let totalPrice = 0;

        for (let item of order.orderedItems) {
            totalPrice += item.price;
        }

        order.totalPrice = totalPrice;
        order.isOrdered = true;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

exports.showCart = async (req, res) => { // Add this method
    const { username } = req.session;
    try {
        const order = await Order.findOne({ username, isOrdered: false }).populate('orderedItems');
        if (order) {
            res.render('cart', { order }); // passing the entire order
        } else {
            res.render('cart', { order: { orderedItems: [] } }); // passing an empty order
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}
exports.listPlacedOrders = async (req, res) => {
    const { username } = req.session;
    try {
        const orders = await Order.find({ username, isOrdered: true }).populate('orderedItems');
        res.render('orders', { orders }); // passing all orders to the orders.ejs view
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
};

exports.listOrders = async (req, res) => {
    const { username } = req.session;
    try {
        const orders = await Order.find({ username }).populate('orderedItems');
        res.render('orders', { orders }); // passing all orders to the orders.ejs view
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}
exports.removeFromCart = async (req, res) => {
    const { petItemId } = req.body;  // Retrieve the item id from the request body
    const { username } = req.session; // Retrieve the username from the session

    try {
        let order = await Order.findOne({ username, isOrdered: false }); // Find the order that hasn't been placed yet
        if (order) {
            const itemIndex = order.orderedItems.indexOf(petItemId); // Find the index of the item to remove
            if (itemIndex > -1) {
                order.orderedItems.splice(itemIndex, 1); // Remove the item from the array
                await order.save(); // Save the updated order
            }
            res.status(200).json(order); // Send back the updated order
        } else {
            res.status(400).json({ error: 'No active order found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}

exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { orderedItems } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(orderId, { orderedItems }, { new: true }).populate('orderedItems');
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}
