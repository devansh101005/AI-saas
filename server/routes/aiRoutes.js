import express from "express";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  generateArticleSchema,
  generateBlogTitleSchema,
  generateImageSchema,
  removeObjectSchema,
} from "../validations/aiValidation.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  resumeReview,
} from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", auth, validate(generateArticleSchema), generateArticle);
aiRouter.post("/generate-blog-title", auth, validate(generateBlogTitleSchema), generateBlogTitle);
aiRouter.post("/generate-images", auth, validate(generateImageSchema), generateImage);
aiRouter.post("/remove-image-background", upload.single("image"), auth, removeImageBackground);
aiRouter.post("/remove-object", upload.single("image"), auth, validate(removeObjectSchema), removeImageObject);
aiRouter.post("/resume-review", upload.single("resume"), auth, resumeReview);

export default aiRouter;
