import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import app from './app';

const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

app.listen(PORT, () => {
  console.log(`🪲 WildBugs backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
