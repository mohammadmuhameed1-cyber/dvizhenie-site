const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let authStorage = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

app.post('/send-code', (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    authStorage[email] = code;

    const mailOptions = {
        from: `Движение Последних <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Твой код входа',
        text: `Твой код доступа в личный кабинет: ${code}`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).json({ error: 'Ошибка при отправке' });
        res.json({ message: 'Код отправлен' });
    });
});

app.post('/verify', (req, res) => {
    const { email, code } = req.body;
    if (authStorage[email] === code) {
        delete authStorage[email];
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Неверный код' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
