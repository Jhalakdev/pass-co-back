const path = require('path');
const cors = require('cors');
const colors = require('colors');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser=require("cookie-parser")
const session = require('express-session');
const { mongoBDConnect } = require('./config/db.js');
const { errorHandler } = require('./middlewares/errorHandler.js');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth.js');
const adminAuthRoutes=require("./routes/AdminRoutes/adminAuth.js");
const companyRoute=require("./routes/AdminRoutes/companyRoute.js");
const planRoutes=require("./routes/AdminRoutes/planRoute.js");
const userPlanRoutes=require("./routes/planUserRoute.js");
const homeRoute=require("./routes/AdminRoutes/homeRoute.js");
const passwordManage=require("./routes/passwordManage.js");
const fileManager=require("./routes/fileManager.js");
const coupen=require("./routes/AdminRoutes/coupen.js");
const cardRoutes=require("./routes/card.js")
// All Middlewares
const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
// app.use(
// 	session({
// 		secret: 'secret',
// 		resave: false,
// 		saveUninitialized: true,
// 		cookie: { secure: false },
// 	})
// );
// app.use(passport.session());
// app.use(passport.initialize());


app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/plan",userPlanRoutes);
app.use("/api/v1/store",passwordManage);
app.use("/api/v1/file",fileManager);
app.use("/api/v1/card",cardRoutes);
app.use('/admin/v1/auth',adminAuthRoutes);
app.use("/admin/v1/company",companyRoute);
app.use("/admin/v1/plan",planRoutes);
app.use("/admin/v1/api",homeRoute);
app.use("/admin/v1/coupen",coupen);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
	mongoBDConnect();
	console.log(`Server is running on this port ${PORT}`.bgGreen.black);
});
