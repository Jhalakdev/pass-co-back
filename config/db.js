const mongoose = require('mongoose');

// MongoDb Connection Configure
exports.mongoBDConnect = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`Mongodb connected successful`.bgMagenta.black);
	} catch (error) {
		console.log(`${error.message}`.bgRed.black);
	}
};
