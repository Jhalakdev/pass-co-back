const helper = require('../helper/helper');
const Notification = require('../models/notificationModel');
const User = require('../models/user/userModel');
const { sendNotification } = require('../utils/sendNotification');

exports.saveFCMToken = catchAsyncFunc(async (req, res) => {
	const { fcmToken } = req.body;

	if (!fcmToken) return helper.sendError(400, res, { error: 'FCM Token is required' }, req);

	const checkUser = await User.findById(req.user._id);
	if (checkUser) {
		checkUser.fcmToken = fcmToken;
		await checkUser.save();
		return helper.sendSuccess(
			res,
			{
				msg: 'FCM Token saved successfully.',
			},

			req
		);
	} else {
		return helper.sendError(404, res, { error: 'User not found' }, req);
	}
});

exports.customFeature = catchAsyncFunc(async (req, res) => {
	try {
		const { body, title } = req.body;
		const result = await sendNotification({ body, title, data: {}, user: req.user._id});

		if (result.success) {
			return helper.sendSuccess(
				res,
				{
					msg: 'Notification sent successfully.',
				},

				req
			);
		}
		console.log(result);
	} catch (err) {
		return helper.sendError(400, res, { error: err.message }, req);
	}
});

exports.getAllNotifications = catchAsyncFunc(async (req, res) => {
	const { page, limit } = req.query;
	console.log(req.user);
	const checkUser = await User.findById(req.user);
	if (!checkUser) {
		return helper.sendError(
			400,
			res,
			{
				error: 'User not found',
			},
			req
		);
	}

	const notifications = await Notification.find({
		user: req.user,
	})
		.populate('user', 'first_name last_name email profilePic createdAt')
		.sort({ createdAt: -1 });
	if (!notifications) {
		return helper.sendSuccess(
			res,
			{
				msg: 'You are caught up with all notifications.',
			},
			req
		);
	}

	// console.log(notifications);

	return helper.sendSuccess(
		res,
		{
			msg: 'Notifications fetched successfully.',
			notifications,
		},

		req
	);
});
