const Card = require('../models/user/cardModel');
const bcrypt = require('bcryptjs');

exports.addCard = async (req, res) => {
    const userId=req.user._id;
    const { cardNumber, cardHolderName, expirationDate, cvv } = req.body;
    if(!cardNumber || !cardHolderName || !expirationDate || !cvv)
        {
            return res.status(401).json({
                success:false,
                message:"Enter all the fields"
            })
        }
    try {
        const newCard = new Card({
            userId,
            cardNumber,
            cardHolderName,
            expirationDate,
            cvv
        });

        await newCard.save();

        return res.status(201).json({
            success: true,
            message: 'Card added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getCards = async (req, res) => {
    try {
        const cards = await Card.find({ userId: req.user._id });

        return res.status(200).json({
            success: true,
            cards
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getACards = async (req, res) => {
    try {
        const cardId=req.body.cardId
        const cards = await Card.findById(cardId);

        return res.status(200).json({
            success: true,
            cards
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
