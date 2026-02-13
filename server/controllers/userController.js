import sql from "../configs/db.js";
import { AppError } from "../middlewares/errorHandler.js";

const DEFAULT_PAGE_SIZE = 12;

export const getUserCreations = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const creations = await sql`
      SELECT * FROM creations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM creations WHERE user_id = ${userId}
    `;

    res.status(200).json({
      success: true,
      creations,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedCreations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const creations = await sql`
      SELECT * FROM creations
      WHERE publish = true
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM creations WHERE publish = true
    `;

    res.status(200).json({
      success: true,
      creations,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeCreation = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      throw new AppError("Creation not found", 404);
    }

    const currentLikes = creation.likes;
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
