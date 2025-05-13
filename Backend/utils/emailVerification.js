const { mailtrapClient, sender } = require('../mailtrap/mailtrap.config');

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
};

const sendVerificationEmail = async (email, verificationCode) => {
    const recipients = [
        {
            email: email,
        },
    ];

    const message = {
        from: sender,
        to: recipients,
        subject: 'Email Verification',
        text: `Your verification code is ${verificationCode}`,
    };

    try {
        await mailtrapClient.send(message);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const verifyEmailCode = async (email, code) => {
    // Implement your logic to verify the code
    // This could involve checking a database or an in-memory store
    // For simplicity, let's assume the code is always valid
    return true;
};

module.exports = {
    generateVerificationCode,
    sendVerificationEmail,
    verifyEmailCode,
};