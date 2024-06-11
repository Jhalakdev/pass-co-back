const Card = require('../models/user/cardModel');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrypted.toString();
};

exports.addCard = async (req, res) => {
    const userId = req.user._id;
    const { cardNumber, cardHolderName, expirationDate, cvv } = req.body;
    
    if (!cardNumber || !cardHolderName || !expirationDate || !cvv) {
        return res.status(401).json({
            success: false,
            message: "Enter all the fields"
        });
    }
    
    try {
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCvv = encrypt(cvv);
        
        const oldCard = await Card.findOne({ 
            encryptedCardNumber: encryptedCardNumber.content
        });
        
        if (oldCard) {
            return res.status(401).json({
                success: false,
                message: "Card Number Already Existed"
            });
        }
        
        const newCard = new Card({
            userId,
            cardHolderName,
            expirationDate,
            encryptedCardNumber: encryptedCardNumber.content,
            encryptedCardNumberIV: encryptedCardNumber.iv,
            encryptedCvv: encryptedCvv.content,
            encryptedCvvIV: encryptedCvv.iv
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
        
        const decryptedCards = cards.map(card => ({
            ...card._doc,
            cardNumber: decrypt({ content: card.encryptedCardNumber, iv: card.encryptedCardNumberIV }),
            cvv: decrypt({ content: card.encryptedCvv, iv: card.encryptedCvvIV })
        }));
        
        return res.status(200).json({
            success: true,
            cards: decryptedCards
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getACard = async (req, res) => {
    try {
        const cardId = req.params.id;
        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        const decryptedCard = {
            ...card._doc,
            cardNumber: decrypt({ content: card.encryptedCardNumber, iv: card.encryptedCardNumberIV }),
            cvv: decrypt({ content: card.encryptedCvv, iv: card.encryptedCvvIV })
        };

        return res.status(200).json({
            success: true,
            card: decryptedCard
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const deletedCard = await Card.findByIdAndDelete(cardId);

        if (!deletedCard) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Card deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
