const { hash, compare, genSalt } = require('bcryptjs');
const crypto = require('crypto');
const CustomError = require('../models/CustomError');

class hashManager {

    generate = async function (password) {
        try {
            if (!password) throw new CustomError(400, 'Enter a password');
            if (password.length < 8) throw new CustomError(400, 'Password must have at least 8 characters');

            const salt = await genSalt(Number(process.env.BCRYPT_ROUNDS));

            const hashPassword = await hash(password, salt);
            if (!hashPassword) throw new CustomError(500, 'DB Error in hash the password');

            return hashPassword;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    compare = async function (password, hashedPassword) {
        return compare(password, hashedPassword);
    };

    encrypt = function (text) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
            const iv = Buffer.from(process.env.IV, 'hex');

            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        } catch (err) {
            console.log(err);
            throw new CustomError(500, 'Error in encryption');
        }
    };

    decrypt = function (encryptedText) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
            const iv = Buffer.from(process.env.IV, 'hex');

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (err) {
            console.log(err);
            throw new CustomError(500, 'Error in decryption');
        }
    };
}

module.exports = new hashManager();
