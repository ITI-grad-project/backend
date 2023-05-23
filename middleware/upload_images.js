const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerOptions = () => {
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: (req, file, cb) => {
      cb(null, `image-${Date.now()}-${file.originalname}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(null, new ApiError("images only allowed", 400));
    }
  };
  const upload = multer({ storage: diskStorage, fileFilter: fileFilter });
  return upload;
};

exports.uploadSingle = (image) => multerOptions().single(image);
exports.mixFiles = (mixImages) => multerOptions().fields(mixImages);
