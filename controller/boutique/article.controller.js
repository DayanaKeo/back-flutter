const Article = require('../../model/article.mongo');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour la gestion des images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const temp_file_arr = file.originalname.split('.');
        const temp_file_name = temp_file_arr[0];
        const temp_file_extension = temp_file_arr[1];
        cb(null, `${temp_file_name}-${Date.now()}.${temp_file_extension}`);
    }
});
const upload = multer({ storage: storage });

exports.create = [
    upload.single('image'),
    async (req, res) => {
        try {
            const article = new Article({
                titre: req.body.titre,
                description: req.body.description,
                prix: parseFloat(req.body.prix),
                stock: parseInt(req.body.stock, 10),
                image: req.file ? `/uploads/${req.file.filename}` : null
            });
            const result = await article.save();
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
];

exports.findAll = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
