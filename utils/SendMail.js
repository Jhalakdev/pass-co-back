const nodemailer=require( "nodemailer");
const dotenv=require( "dotenv");

const { AUTH_EMAIL, AUTH_PASSWORD } = process.env;

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: AUTH_EMAIL,
      pass: AUTH_PASSWORD,
    },
  });
  

const sendVerificationEmail = async (email, token) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const msg = {
		to: email,
		from: process.env.BUSINESS_EMAIL,
		subject: 'Verify your email address',
		html: `
      <div>
        <strong>Welcome to our community!</strong>
        <p>Please take a moment to verify your email address and unlock the full potential of our platform.</p>
        <a href="${process.env.FRONTEND_URL}/auth/verify-email/${token}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px;">Click here to verify</a>
        <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${process.env.FRONTEND_URL}/auth/verify-email/${token}</p>
        <p>Thank you for joining us on this exciting journey!</p>
        <p>Sincerely,</p>
        <p>The Mong So Team</p>
      </div>
    `,
	};

	try {
		await sgMail.send(msg);
	} catch (error) {
		throw new Error(error);
	}
};

const sendEmailVerificationCode = async ( email, code ) => {
	const mailOptions = {
		to: email,
		from: AUTH_EMAIL,
		subject: 'Verify your email address',
		html: `
    <html lang="en-US">
    
    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Confirm Your Email Address</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                Enter the following code on Pacedream to verify your identity.
                                            </p>
                                            <div style="background-color: #4F46E5; margin-top: 20px; width: 100%; height: 60px; border-radius: 12px;">
                                              <span style="text-align:center; font-size:23px; line-height:60px; height:60px; letter-spacing: 4px; font-weight: bold; color: white;">${code}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.pacedream.com</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    
    </html>
    `,
	};
	try {
        transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "PENDING",
            message: "Reset Password Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Something went wrong" });
        });
	} catch (err) {
		throw new Error(err);
	}
};

const sendForgotPasswordEmail = async (email, code,res) => {

	const mailOptions = {
		from: AUTH_EMAIL,
        to: email,
        subject: "Reset You Password Manager Password",
		html: `
    <html lang="en-US">
    
    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Reset Your Password</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                Enter the following code on PasswordManager to verify your identity.
                                            </p>
                                            <div style="background-color: #4F46E5; margin-top: 20px; width: 100%; height: 60px; border-radius: 12px;">
                                              <span style="text-align:center; font-size:23px; line-height:60px; height:60px; letter-spacing: 4px; font-weight: bold; color: white;">${code}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.passwordManager.com</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    
    </html>
    `,
	};

	try {
        transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "PENDING",
            message: "Reset Password Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Something went wrong" });
        });
	} catch (error) {
		throw new Error(error);
	}
};

const sendContactUsEmail = async (email, name, message) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const msg = {
		to: process.env.BUSINESS_EMAIL,
		from: process.env.BUSINESS_EMAIL,
		subject: 'Contact Us',
		html: `<div>
      <strong>Contact Us</strong>

      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
      </div>`,
	};

	try {
		await sgMail.send(msg);
	} catch (error) {
		throw new Error(error);
	}
};




module.exports = {
	sendVerificationEmail,
	sendForgotPasswordEmail,
	sendContactUsEmail,
	sendEmailVerificationCode,
};
