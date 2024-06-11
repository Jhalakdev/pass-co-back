const Plan = require("../models/admin/planModel");
const User = require("../models/user/userModel");
const Order = require("../models/user/orderModel");
const helper = require("../helper/helper");
const { createFolder, checkFolderExists } = require("../storage/createStorage");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// exports.selectPlan = async (req, res) => {
//     try {
//         const planId = req.params.id;
//         const userId = req.user._id;
//         const { paymentMethodId } = req.body; // Assuming paymentMethodId is sent in the request body

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const plan = await Plan.findById(planId);
//         if (!plan) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Plan does not exist"
//             });
//         }

//         // Check if user already has the plan
//         if (plan.user.includes(userId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "You are already in this plan"
//             });
//         }

//         // Create an order with 'pending' payment status
//         const order = new Order({
//             userId: userId,
//             planId: planId,
//             amount: plan.price.toString(),
//             currency: 'usd',
//             paymentStatus: 'pending',
//             paymentMethod: paymentMethodId
//         });

//         await order.save();

//         // Create a payment intent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: plan.price * 100, // amount in cents
//             currency: 'usd',
//             payment_method: paymentMethodId,
//             confirmation_method: 'manual',
//             confirm: true,
//         });

//         if (paymentIntent.status !== 'succeeded') {
//             // Update order status to 'failed'
//             order.paymentStatus = 'failed';
//             await order.save();
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment failed"
//             });
//         }

//         // Update order status to 'completed' and add transaction ID
//         order.paymentStatus = 'completed';
//         order.transactionId = paymentIntent.id;
//         await order.save();

//         // Check if user is in a different plan and remove them
//         const userCurrentPlan = await Plan.findOne({ user: userId });
//         if (userCurrentPlan) {
//             // Remove user from current plan
//             const index = userCurrentPlan.user.indexOf(userId);
//             if (index > -1) {
//                 userCurrentPlan.user.splice(index, 1);
//                 await userCurrentPlan.save();
//             }
//         }

//         // Add user to the selected plan
//         plan.user.push(userId);
//         await plan.save();
//         user.plan.planId = plan._id;
//         await user.setPlan(plan.planType);
//         if (user.plan.planType !== "FREE") {
//             user.fileshare = true;
//         }
//         await user.save();

//         const storageZoneName = process.env.BUNNY_ZONE_NAME;
//         const folderName = user._id.toString();
//         const storageZonePassword = process.env.BUNNY_ZONE_KEY;
//         const folderExists = await checkFolderExists(storageZoneName, folderName, storageZonePassword);
//         if (!folderExists) {
//             await createFolder(storageZoneName, folderName, storageZonePassword);
//         }

//         return res.status(201).json({
//             success: true,
//             message: "Thank you for choosing this plan"
//         });
//     } catch (err) {
//         return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
//     }
// };
exports.selectPlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Plan does not exist"
            });
        }

        // Check if user already has the plan
        if (plan.user.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You are already in this plan"
            });
        }

        // Create an order with 'pending' payment status
        const order = new Order({
            userId: userId,
            planId: planId,
            amount: plan.cost,
            currency: 'usd',
            paymentStatus: 'pending'
        });

        await order.save();

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                    },
                    unit_amount: plan.cost * 100, // amount in cents
                },
                quantity: 1,
            }],
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                orderId: order._id.toString()
            },
        });

        return res.status(200).json({
            success: true,
            sessionId: session.id
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};



exports.fileShare = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const plan = await Plan.findById(user.plan.planId);

        const userUsedSpace = await helper.convertToBytes(user.plan.usedSpace);
        const allocatedSpace = plan.allocatedSpace;
        const availableSpace = allocatedSpace - userUsedSpace;

        if (!user.fileshare) {
            return res.status(400).json({
                success: false,
                message: "You Are Not Allowed to share File"
            });
        }

        if (availableSpace <= 0) {
            return res.status(400).json({
                success: false,
                message: "Your Storage is full"
            });
        }

        const filepath = req.files[0];
        if (!filepath) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const fileSize = filepath.size;
        if (fileSize > availableSpace) {
            return res.status(400).json({
                success: false,
                message: "Your Storage is full"
            });
        }

        const file = await handleFileUpload(filepath, userId);
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File upload failed"
            });
        }

        let userFile = await File.findOne({ userId });
        if (userFile) {
            userFile.file.push(file);
            await userFile.save();
        } else {
            userFile = await File.create({ userId, file: [file] });
            await userFile.save();
        }

        const totalSpaceUsed = await getTotalStorage(process.env.BUNNY_ZONE_NAME);
        const folderSize = totalSpaceUsed.folderSizes[userId]; // Get folder size in MB, GB, TB, KB
        const folderSizeByte = await helper.convertToBytes(folderSize);
        const availableSpaceByte = allocatedSpace - folderSizeByte;

        user.plan.usedSpace = folderSize;
        plan.usedSpace = await helper.formatFileSize(totalSpaceUsed.totalSizeBytes);
        plan.availableSpace = await helper.formatFileSize(availableSpaceByte);

        await user.save();
        await plan.save();

        return res.status(201).json({
            success: true,
            message: "File Stored Successfully"
        });

    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};
