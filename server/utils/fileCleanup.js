import fs from 'fs';

// Safely delete a temporary file after it has been processed
// Uses fs.unlink (async, non-blocking) — does not throw if file is missing
export const cleanupFile = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      // ENOENT = file already gone — not a real error
      console.error('Failed to clean up temp file:', filePath, err.message);
    }
  });
};
