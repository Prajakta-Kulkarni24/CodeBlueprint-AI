const express = require("express");

const {
    create,
    getAll,
    getOne,
    remove,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    upload.array("codeFiles", 100),
    create
);

router.get(
    "/",
    authMiddleware,
    getAll
);

router.get(
    "/:id",
    authMiddleware,
    getOne
);

router.delete(
    "/:id",
    authMiddleware,
    remove
);

module.exports = router;