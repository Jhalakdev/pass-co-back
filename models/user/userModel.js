const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const { addTimeToDate } = require('../../helper/helper');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
        },
        profilePic: {
            type: String,
        },
        mobile: {
            type: String,
            unique: true,
        },
        fcmToken: {
            type: String,
        },
        terms: {
            type: Boolean,
            required: true,
            default: false,
        },
        token: {
            type: String,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        verifyToken: {
            type: String,
            default: null,
        },
        resetToken: {
            type: String,
            default: null,
        },
        rememberMe: {
            type: Boolean,
            default: false,
        },
        role_id: {
            type: Number,
            default: 0,
        },
        uid: {
            type: String,
        },
        fileshare: {
            type: Boolean,
            default: false,
        },
        mobileotp: {
            type: String,
            default: ""
        },
        emailotp: {
            type: String,
            default: ""
        },
        plan: {
            planId: {
                type: mongoose.Types.ObjectId,
                ref: "Plan",
                default:null
            },
            planType: {
                type: String,
                default: "FREE"
            },
            createdIn: {
                type: String,
                default: function () {
                    return new Date().toISOString().split('T')[0];
                }
            },
            expiresIn: {
                type: String,
                default:null
            },
            usedSpace: {
                type: String,
                default: 0
            },
            originalPlan: {
                planId: {
                    type: mongoose.Types.ObjectId,
                    ref: "Plan",
                    default: null
                },
                planType: {
                    type: String,
                    default: null
                },
                expiresIn: {
                    type: String,
                    default: null
                }
            }
        },
        passwordStorage: {
            storage: [{
                type: mongoose.Types.ObjectId,
                ref: "PassKey"
            }],
            total: {
                type: Number,
                default: 0
            }
        },
        familyAndFriends: {
            members: [{
                type: mongoose.Types.ObjectId,
                ref: "User"
            }],
            total: {
                type: Number,
                default: 0
            }
        },
        paymentHistory: [
            {
              orderId:{
                type:mongoose.Types.ObjectId,
                ref:"Order"
              },
              amount: Number,
              currency: "string",
              paymentDate: Date
            }
          ]
    },
    { timestamps: true }
);

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.canStoreMorePasswords = async function() {
    const user = await this.populate('plan').execPopulate();
    const plan = user.plan;
    const currentPasswordCount = user.passwordStorage.total;
    const limit = plan ? plan.passwordLimit : 0;
    return currentPasswordCount < limit;
};

userSchema.methods.canAddMoreFamilyAndFriends = async function() {
    const user = await this.populate('plan').execPopulate();
    const plan = user.plan;
    const currentFamilyAndFriendsCount = this.familyAndFriends.length;
    const limit = plan ? plan.familyAndFriendsLimit : 0;
    return currentFamilyAndFriendsCount < limit;
};

userSchema.methods.setPlan =async function(planType) {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];  // Format date as yyyy-mm-dd
    this.plan.planType = planType;
    this.plan.createdIn = formattedDate;
    
    let expiresInDate;
    if (planType === 'MONTHLY') {
        expiresInDate = await addTimeToDate(now, 'month', 1);
    } else if (planType === 'YEARLY') {
        expiresInDate = await addTimeToDate(now, 'year', 1);
    } else {
        // Handle other plan types if necessary
        expiresInDate = formattedDate;
    }
    
    this.plan.expiresIn = expiresInDate;
};


const User = mongoose.model('User', userSchema);
module.exports=User
