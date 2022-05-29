const express = require("express");
const router = express.Router();
const Pangolin = require("../models/pangolin");
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const resize = require("../utils/resize");
require("dotenv").config();

router.get("/ping", (req, res) => {
  res.status(200).json({ msg: "pong", date: new Date() });
});

router.get("/pangolins", (req, res) => {
  Pangolin.find()
    .sort({ createdOn: -1 })
    .exec()
    .then((pangolins) => res.status(200).json(pangolins))
    .catch((err) =>
      res.status(500).json({
        message: "Not found",
        error: err,
      })
    );
});

router.get("/pangolins/:id", (req, res) => {
  const id = req.params.id;
  Pangolin.findById(id)
    .then((pangolins) => res.status(200).json(pangolins))
    .catch((err) =>
      res.status(500).json({
        message: `pangolin with id ${id} not found`,
        error: err,
      })
    );
});

router.post("/pangolins", (req, res) => {
  console.log("req.body", req.body);
  const pangolin = new Pangolin({ ...req.body, image: lastUploadedImageName });
  pangolin.save((err, pangolin) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(201).json(pangolin);
  });
});

router.delete("/pangolins/:id", (req, res) => {
  const id = req.params.id;
  Pangolin.findByIdAndDelete(id, (err, pangolin) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json({ msg: `pangolin with id ${pangolin._id} deleted` });
  });
});

router.delete("/pangolins", (req, res) => {
  const ids = req.query.ids;
  console.log("query allIds", ids);
  const allIds = ids.split(",").map((id) => {
    // casting as a mongoose ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return mongoose.Types.ObjectId(id);
    } else {
      console.log("id is not valid", id);
      return -1;
    }
  });
  const condition = { _id: { $in: allIds } };

  Pangolin.deleteMany(condition, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json(result);
  });

  Pangolin.findByIdAndDelete(id, (err, pangolin) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json({ msg: `blog post with id ${pangolin._id} deleted` });
  });
});

// file upload configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return callback(err);
      lastUploadedImageName =
        raw.toString("hex") + path.extname(file.originalname);
      callback(null, lastUploadedImageName);
    });
  },
});

var upload = multer({ storage: storage });

// file upload
router.post("/pangolins/images", upload.single("image"), (req, res) => {
  console.log("req.file", req.file);
  if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return res.status(400).json({ msg: "only image files please" });
  }
  res.status(201).send({ fileName: req.file.filename, file: req.file });
});

router.get("/images/:image", (req, res) => {
  const image = req.params.image;
  res.sendFile(path.join(__dirname, `./uploads/${image}`));
});

let lastUploadedImageName = "";

router.put("/pangolins/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const conditions = { _id: id };
  const Pangolin = { ...req.body, image: lastUploadedImageName };
  const update = { $set: Pangolin };
  const options = {
    upsert: true,
    new: true,
  };
  Pangolin.findOneAndUpdate(conditions, update, options, (err, response) => {
    if (err) return res.status(500).json({ msg: "update failed", error: err });
    res
      .status(200)
      .json({ msg: `document with id ${id} updated`, response: response });
  });
});

module.exports = router;
