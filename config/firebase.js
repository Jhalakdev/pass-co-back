const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to verify Google ID token
exports.verifyGoogleToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

exports.sendNotification=async(fcmToken,message,title,res)=>{
 try{
  const messaging = admin.messaging()
  let payload = {
      notification: {
          title: title,
          body: message
      },
      token: fcmToken,
      };


  messaging.send(payload)
  .then((result) => {
      console.log("Message Sent Successfully");
  })
 }catch(err){
  return res.status(500).json({
    succes:false,
    message:"Internal Server error"
  })
 }
}

exports.notificationMessages = {
  profilePhotoUpdated: {
    title: "Profile Photo Updated",
    message: "Your profile photo has been successfully updated."
  },
  paymentSuccess: {
    title: "Payment Successful",
    message: "Your payment has been processed successfully. Thank you!"
  },
  changePassword: {
    title: "Password Changed",
    message: "Password Changed Successfully"
  },
  planChosen: {
    title: "Plan Selection",
    message: "You have successfully chosen your plan. Enjoy the benefits!"
  }
};