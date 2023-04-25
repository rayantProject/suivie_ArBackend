import morgan from 'morgan';
import { mkdirSync, createWriteStream, existsSync } from 'fs';
import { join } from 'path';

const logsDir = join(__dirname, 'log');

!existsSync(logsDir) && mkdirSync(logsDir);

export default morgan('combined', { stream: createWriteStream(join(logsDir, 'access.log'), { flags: 'a' }) });
