import emailjs from '@emailjs/nodejs';
import axios from 'axios';
const privateKey = process.env.EMAILJS_SECRETS || ""
const PICKLETT_EMAIL_PASSWORD = process.env.PICKLETT_EMAIL_PASSWORD || ""
let emailjs_inited = false
const emailjs_init = () => {
    if (emailjs_inited) return
    emailjs.init({ publicKey: "nGp10yruPTJYfkSqK", privateKey });
    emailjs_inited = true
}
export const sendWarDrawnEmail = (warId: string) => {
    emailjs_init()
    emailjs.send("service_j6fgxav", "template_vqi36sl", {
        recipient_address: "milkyway464203@gmail.com",
        reply_to: "milkyway464203@gmail.com",
        warId: warId
    }).then(
        (response) => {
            console.log('SUCCESS!', response.status, response.text);
        },
        (err) => {
            console.log('FAILED...', err);
        },
    );
}
export const sendVerifyEmail = ({ link, email }: { link: string, email: string }) => {
    axios.post("https://send.api.mailtrap.io/api/send", {
        from: {
            email: "noreply@picklett.com",
            name: "Picklett"
        },
        to: [
            { email }
        ],
        subject: "Verify Email Address",
        html: `<div style=" font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 20px 14px; background-color: #f5f5f5; "><div style="max-width: 600px; margin: auto; background-color: #fff"><div style="text-align: center; background-color: #333; padding: 14px"><a style="text-decoration: none; outline: none" href="https://www.picklett.com" target="_blank"><img style="height: 32px; vertical-align: middle" height="32px" src="https://www.picklett.com/favicon.ico" alt="logo" /><span style="color:#111; font-size:20px; vertical-align:middle;">Picklett</span></a></div><div style="padding: 14px"><h1 style="font-size: 22px; margin-bottom: 26px">Email Verification</h1><p> Confirm your email address to finish setting up your account. Click the confirm email address button below to activate your account. </p><a href="${link}" target="_blank" style="cursor:pointer; text-decoration: none; opacity: 1;background-color: #1187C1;opacity: 1;color: white;font-size: 16px;font-weight: 700;font-style: normal;letter-spacing: 0.07px;text-align: center;padding: 10px 20px;cursor: pointer;border: 0px;"> Confirm email address </a><p> If you didn't request this email verification, please ignore this email or let us know immediately. Your account remains secure. </p><p> If you're having trouble clicking button, copy and paste the URL below into your web browser: </p><p><a href="${link}">${link}</a></p><p>Best regards,<br />Picklett Team</p></div></div><div style="max-width: 600px; margin: auto"><p style="color: #999"> The email was sent to ${email}<br /> You received this email because you are registered with Picklett.com </p></div></div>`
    }, {
        headers: {
            Authorization: `Bearer ${PICKLETT_EMAIL_PASSWORD}`
        }
    })
        .then(() => console.log(`Email sent to ${email}`))
        .catch(() => console.error(`Error in sending email to ${email}`))
}
/*
import Nodemailer, { SentMessageInfo, SendMailOptions } from 'nodemailer';
export const sendVerifyEmail = ({ link, email }: { link: string, email: string }) => {
    const transporter = Nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'admin@picklett.com',
            pass: PICKLETT_EMAIL_PASSWORD
        }
    });
    const mailOptions: SendMailOptions = {
        from: "Picklett<admin@picklett.com>",
        to: email as string,
        subject: 'Verify Email Address',
        html: `<div style=" font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 20px 14px; background-color: #f5f5f5; "><div style="max-width: 600px; margin: auto; background-color: #fff"><div style="text-align: center; background-color: #333; padding: 14px"><a style="text-decoration: none; outline: none" href="https://www.picklett.com" target="_blank"><img style="height: 32px; vertical-align: middle" height="32px" src="https://www.picklett.com/favicon.ico" alt="logo" /><span style="color:#111; font-size:20px; vertical-align:middle;">Picklett</span></a></div><div style="padding: 14px"><h1 style="font-size: 22px; margin-bottom: 26px">Email Verification</h1><p> Confirm your email address to finish setting up your account. Click the confirm email address button below to activate your account. </p><a href="${link}" target="_blank" style="cursor:pointer; text-decoration: none; opacity: 1;background-color: #1187C1;opacity: 1;color: white;font-size: 16px;font-weight: 700;font-style: normal;letter-spacing: 0.07px;text-align: center;padding: 10px 20px;cursor: pointer;border: 0px;"> Confirm email address </a><p> If you didn't request this email verification, please ignore this email or let us know immediately. Your account remains secure. </p><p> If you're having trouble clicking button, copy and paste the URL below into your web browser: </p><p><a href="${link}">${link}</a></p><p>Best regards,<br />Picklett Team</p></div></div><div style="max-width: 600px; margin: auto"><p style="color: #999"> The email was sent to ${email}<br /> You received this email because you are registered with Picklett.com </p></div></div>`
    };
    transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email ${email} sent: ${info.response}`);
        }
    });
}
*/