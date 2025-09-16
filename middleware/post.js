const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './posts'); // Folder where files will be stored
  },
  filename: function (req, file, cb) {
    // ✅ Corrected: use file.originalname
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const post = multer({ storage: storage });
module.exports = post;