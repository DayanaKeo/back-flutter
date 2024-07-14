// generateController.js
const Joi = require('joi');
const Qrcode = require('../../model/qrcodeModel');

const childIdSchema = Joi.object({
    child_id: Joi.number().integer().positive().required()
});

exports.generate = async (req, res) => {
    const { error } = childIdSchema.validate(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const childId = req.params.child_id;
    try {
        const qrCodeUrl = await Qrcode.generate(childId);
        res.send(`<img src="${qrCodeUrl}" alt="QR Code" />`);
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
};

exports.getChildContactInfo = async (req, res) => {
    const { error } = childIdSchema.validate(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const childId = req.params.child_id;
    try {
        const data = await Qrcode.getChildContactInfo(childId);
        if (data) {
            if (!data.is_activated) {
                await Qrcode.activate(childId);
                data.is_activated = true;
            }
            res.send(`
                <html>
                <head>
                    <title>Contact Info</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background-color: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        p {
                            margin: 8px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Contact Information</h1>
                        <h2>Child Info</h2>
                        <p>Name: ${data.child_firstname} ${data.child_lastname}</p>
                        <p>Age: ${data.child_age}</p>
                        <h2>Emergency Contact</h2>
                        <p>Name: ${data.contact_firstname} ${data.contact_lastname}</p>
                        <p>Phone: ${data.contact_phone}</p>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.status(404).send('Information not found');
        }
    } catch (err) {
        res.status(500).send('Error fetching data');
    }
};