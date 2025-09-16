const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './profiles'); // Folder where files will be stored
  },
  filename: function (req, file, cb) {
    // ✅ Corrected: use file.originalname
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
module.exports = upload;