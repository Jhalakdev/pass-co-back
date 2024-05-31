const dotenv=require('dotenv')
dotenv.config();
const accountSid = process.env.TWLIO_SID;
const authToken = process.env.TWLIO_TOKEN;
const client = require('twilio')(accountSid, authToken);

exports.sendForgetPasswordOtp = async(mobileNumber, otp) => {
  try{
    await client.messages
  .create({
      body: `Your OTP is: ${otp} valid for 5 Min`,
      from: '+17204632151',
      messagingServiceSid: process.env.TWLIO_SERVICE_ID,
      to: `+91${mobileNumber}`
  })
  }catch(err)
  {
    console.log(err);
  }
};
