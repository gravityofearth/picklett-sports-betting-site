import emailjs from '@emailjs/nodejs';
const privateKey = process.env.EMAILJS_SECRETS || ""
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
    emailjs_init()
    emailjs.send("service_n3ygx3e", "template_kj2onyi", { link, email }).then(
        (response) => {
            console.log('SUCCESS!', response.status, response.text);
        },
        (err) => {
            console.log('FAILED...', err);
        },
    );
}