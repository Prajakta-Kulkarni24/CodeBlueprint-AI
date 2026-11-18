const express = require("express");
const multer = require("multer");
const { analyzeCode } = require("../controllers/codeController");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("codeFile"), analyzeCode);

module.exports = router;