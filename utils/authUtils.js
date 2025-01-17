const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config()

const secretKey = process.env.SECRET_KEY



function verifyingToken(role) {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        console.log("=====================",req.headers);
        if (!token) {
            return res.status(403).json({ message: "Token not provided" })
        }
        jwt.verify(token, secretKey, (err, decode) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" })
            }
            if (decode.role !== role) {
                return res.status(403).json({ message: `Unauthorized access` })
            }
            req.decode = decode
            next();
        })
    }
}

const hashPassword = (password) => {
    const saltRounds = 12;
    return bcrypt.hashSync(password, saltRounds);
};



const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'faculty')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage })



module.exports = {
    secretKey,
    verifyingToken,
    hashPassword,
    storage,
    upload
}