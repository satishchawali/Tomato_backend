import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
    const frontend_url = "https://delicate-cupcake-6d1a0f.netlify.app";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100) // Ensure the price is in cents
            },
            quantity: item.quantity
        }));

        // Adding delivery charges
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: 2 * 100 // Delivery charge in cents
            },
            quantity: 1
        });

        console.log('Line items: ', line_items); // Logging line items for debugging

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error('Error placing order: ', error);
        res.json({ success: false, message: 'Error' });
    }
};

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    console.log(`Received verification request: orderId=${orderId}, success=${success}`);

    try {
        if (success === 'true') {
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
            if (updatedOrder) {
                console.log(`Order ${orderId} marked as paid.`);
                res.json({ success: true, message: 'Paid' });
            } else {
                console.error(`Order ${orderId} not found.`);
                res.json({ success: false, message: 'Order not found' });
            }
        } else {
            const deletedOrder = await orderModel.findByIdAndDelete(orderId);
            if (deletedOrder) {
                console.log(`Order ${orderId} deleted as payment was not successful.`);
                res.json({ success: false, message: 'Not Paid' });
            } else {
                console.error(`Order ${orderId} not found.`);
                res.json({ success: false, message: 'Order not found' });
            }
        }
    } catch (error) {
        console.error(`Error verifying order ${orderId}:`, error);
        res.json({ success: false, message: 'Error' });
    }
};

// User orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error' });
    }
};

// Listing orders for admin pane
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error' });
    }
};

// API for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error' });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
