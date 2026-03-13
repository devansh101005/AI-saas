import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import fs from "fs";
import pdf from "pdf-parse-fork";
import FormData from "form-data";
import { AppError } from "../middlewares/errorHandler.js";
import { invalidateUserCache } from "../middlewares/auth.js";
import { cleanupFile } from "../utils/fileCleanup.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// ──────────────────────────────────────────────
// Shared helper: checks free plan limit & increments usage after success
// Eliminates the duplicated plan-check logic from every controller
// ──────────────────────────────────────────────
const checkPlanLimit = (plan, freeUsage) => {
  if (plan !== "Premium" && freeUsage >= 10) {
    throw new AppError("Free limit exceeded. Upgrade to Premium to continue.", 403);
  }
};

const incrementFreeUsage = async (plan, userId, freeUsage) => {
  if (plan !== "Premium") {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { free_usage: freeUsage + 1 },
    });
    invalidateUserCache(userId);
  }
};

const requirePremium = (plan) => {
  if (plan !== "Premium") {
    throw new AppError("This feature requires a Premium subscription.", 403);
  }
};

// ──────────────────────────────────────────────
// Sanitize user prompt — strip HTML/script tags to prevent injection
// ──────────────────────────────────────────────
const sanitizePrompt = (text) => {
  return text.replace(/<[^>]*>/g, "").trim();
};

// ──────────────────────────────────────────────
// Controllers
// ──────────────────────────────────────────────

export const generateArticle = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    checkPlanLimit(plan, free_usage);

    const cleanPrompt = sanitizePrompt(prompt);

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [{ role: "user", content: cleanPrompt }],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, ${cleanPrompt}, ${content}, 'article')`;

    await incrementFreeUsage(plan, userId, free_usage);

    res.status(201).json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

export const generateBlogTitle = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const { plan, free_usage } = req;

    checkPlanLimit(plan, free_usage);

    const cleanPrompt = sanitizePrompt(prompt);

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [{ role: "user", content: cleanPrompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, ${cleanPrompt}, ${content}, 'blog-title')`;

    await incrementFreeUsage(plan, userId, free_usage);

    res.status(201).json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

export const generateImage = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const { plan } = req;

    requirePremium(plan);

    const cleanPrompt = sanitizePrompt(prompt);

    const formData = new FormData();
    formData.append("prompt", cleanPrompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
    const uploadResult = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations(user_id, prompt, content, type, publish)
      VALUES(${userId}, ${cleanPrompt}, ${uploadResult.secure_url}, 'image', ${publish ?? false})`;

    res.status(201).json({ success: true, content: uploadResult.secure_url });
  } catch (error) {
    next(error);
  }
};

export const removeImageBackground = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const { plan } = req;

    requirePremium(plan);

    if (!image) {
      throw new AppError("Image file is required.", 400);
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove the background",
        },
      ],
    });

    cleanupFile(image.path);

    await sql`INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

    res.status(201).json({ success: true, content: secure_url });
  } catch (error) {
    cleanupFile(req.file?.path);
    next(error);
  }
};

export const removeImageObject = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const { plan } = req;

    requirePremium(plan);

    if (!image) {
      throw new AppError("Image file is required.", 400);
    }

    const sanitizedObject = sanitizePrompt(object);

    const { public_id } = await cloudinary.uploader.upload(image.path);

    cleanupFile(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${sanitizedObject}` }],
      resource_type: "image",
    });

    await sql`INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, ${`Remove ${sanitizedObject} from image`}, ${imageUrl}, 'image')`;

    res.status(201).json({ success: true, content: imageUrl });
  } catch (error) {
    cleanupFile(req.file?.path);
    next(error);
  }
};

export const resumeReview = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const { plan } = req;

    requirePremium(plan);

    if (!resume) {
      throw new AppError("Resume file is required.", 400);
    }

    if (resume.size > 5 * 1024 * 1024) {
      cleanupFile(resume.path);
      throw new AppError("Resume size exceeds allowed limit (5MB).", 413);
    }

    const dataBuffer = fs.readFileSync(resume.path);
    cleanupFile(resume.path);

    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive
    feedback on its strength, weakness, and areas for improvement. Resume
    content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.status(201).json({ success: true, content });
  } catch (error) {
    cleanupFile(req.file?.path);
    next(error);
  }
};
