const express = require("express");
const router = express.Router();
const { createPost, getPosts } = require("../controllers/communityController");
const upload = require("../config/multer");
const { requireAuth } = require("../middleware/requireAuth");

/**
 * Route: POST /api/community/posts
 * Multi-image support (up to 5 images) for Community Posts.
 */
router.post(
  "/posts",
  requireAuth,
  upload.array("images", 5),
  createPost
);

/**
 * Route: GET /api/community/posts
 * Fetch the social feed.
 */
router.get("/posts", requireAuth, getPosts);

module.exports = router;
