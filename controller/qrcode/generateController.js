const Joi = require('joi');
const Qrcode = require('../../model/qrcodeModel');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

const generateSchema = Joi.object({
    child_id: Joi.number().integer().positive().required(),
    contact_id: Joi.number().integer().positive().required(),
    user_id: Joi.number().integer().positive().required()
});

const childIdSchema = Joi.object({
    child_id: Joi.number().integer().positive().required()
});

const createSchema = Joi.object({
    child_id: Joi.number().required(),
    contact_id: Joi.number().required(),
    user_id: Joi.number().required()
});

exports.create = async (req, res) => {
    const { error } = createSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { child_id: childId, contact_id: contactId, user_id: userId } = req.body;
    try {
        const qrCodeId = await Qrcode.create(childId, contactId, userId);
        res.status(201).send({ qrCodeId });
    } catch (err) {
        console.error('Error creating QR code record:', err);
        res.status(500).send('Error creating QR code record');
    }
};

exports.generate = async (req, res) => {
    const { error } = generateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { child_id: childId, contact_id: contactId, user_id: userId } = req.body;
    try {
        const qrData = `http://localhost:4000/qr-code/contact_info/${childId}`;
        const qrCodeFilePath = path.join(__dirname, '../public/qr-codes', `${childId}_${contactId}_${userId}.png`);
        
        console.log('Generating QR code with data:', qrData);
        console.log('QR code file path:', qrCodeFilePath);

        await qrcode.toFile(qrCodeFilePath, qrData);
        console.log('QR code generated and saved to file');

        const qrCodeUrl = `http://localhost:4000/public/qr-codes/${childId}_${contactId}_${userId}.png`;
        res.send({ qrCodeUrl });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).send('Error generating QR code');
    }
};

exports.getChildContactInfo = async (req, res) => {
    const { error } = childIdSchema.validate(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const { child_id: childId } = req.params;
    try {
        const data = await Qrcode.getChildContactInfo(childId);
        if (data) {
            if (!data.is_activated) {
                await Qrcode.activate(childId);
                data.is_activated = true;
            }
            res.status(200).send(data);
        } else {
            res.status(404).send('Information not found');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
};
