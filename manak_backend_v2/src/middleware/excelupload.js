const multer = require("multer");

const excelUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".xlsx",
      ".xls",
    ];

    const fileName =
      String(file.originalname || "")
        .toLowerCase();

    const isAllowed =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!isAllowed) {
      return cb(
        new Error(
          "Only Excel files (.xlsx or .xls) are allowed."
        )
      );
    }

    cb(null, true);
  },
});

module.exports = excelUpload;