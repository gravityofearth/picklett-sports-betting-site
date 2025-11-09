import emailjs from '@emailjs/nodejs';
const EMAILJS_SECRETS = process.env.EMAILJS_SECRETS || ""
export const sendEmail = (warId: string) => {
    const { publicKey, privateKey, serviceId, templateId, } = JSON.parse(EMAILJS_SECRETS)
    emailjs.init({ publicKey, privateKey });
    emailjs.send(serviceId, templateId, {
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