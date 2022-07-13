const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Sanskar Soni <${process.env.EMAIL_FROM}>`;
    }
 
    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                }
            })
        }
        return nodemailer.createTransport({
            port: process.env.EMAIL_PORT,
            host: process.env.EMAIL_HOST,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    //send actual email

    async send(template, subject){
        // 1 Render html based on the pug template

        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2 Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: htmlToText.convert(html),
            html 
        };

        // 3. Create transport and send email
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the StoreUp');
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10 mins)');
    }

    async sendOtp(){
        await this.send('otp', 'Your OTP for Verification (valid for only 10 mins)');
    }
}

