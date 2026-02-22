const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ================= CREATE =================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    const { category, title, points } = req.body;

    // Validate required fields
    if (!category || !title || !points || !req.file) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide category, title, image, and points." 
      });
    }

    // Parse points
    let parsedPoints;
    try {
      parsedPoints = JSON.parse(points);
    } catch (error) {
      return res.status(400).json({ message: "Invalid points format" });
    }

    // Upload image to Cloudinary
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "services",
    });

    // Create service
    const service = await Service.create({
      category,
      title,
      image: uploadResult.secure_url,
      points: parsedPoints,
    });

    res.status(201).json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ================= GET BY CATEGORY =================
router.get("/category/:category", async (req, res) => {
  try {
    const services = await Service.find({
      category: req.params.category,
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ================= GET SINGLE SERVICE =================
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ================= UPDATE =================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { category, title, points } = req.body;

    if (!category || !title || !points) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

    let parsedPoints;
    try {
      parsedPoints = JSON.parse(points);
    } catch (error) {
      return res.status(400).json({ message: "Invalid points format" });
    }

    let updateData = {
      category,
      title,
      points: parsedPoints,
    };

    // If new image is uploaded
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "services",
      });

      updateData.image = uploadResult.secure_url;
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }

    res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ================= DELETE =================
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: "Service not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;