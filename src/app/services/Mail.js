const nodemailer = require('nodemailer')
const mailConfig = require('../../config/auth')

const transport = nodemailer.createTransport(mailConfig)

module.exports = transport
