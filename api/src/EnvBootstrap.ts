import { config } from 'dotenv';
import * as path from 'path';

// Resolve .env located at the repository root (three levels up from src)
const envPath = path.resolve(__dirname, '../../../.env');
config({ path: envPath });

export const envReady = true; // ensures module runs on import
