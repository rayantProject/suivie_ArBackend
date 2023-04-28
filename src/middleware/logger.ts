import morgan from 'morgan';
import { mkdirSync, createWriteStream, existsSync } from 'fs';
import { join } from 'path';

const logsDir = join(__dirname, 'log');
!existsSync(logsDir) && mkdirSync(logsDir);
export default morgan(`
    {
        "method": ":method",
        "url": ":url",
        "status": ":status",
        "response-time": ":response-time",
        "remote-addr": ":remote-addr",
        "remote-user": ":remote-user",
        "http-version": ":http-version",
        "user-agent": ":user-agent",
        "date": ":date[iso]",
        "referrer": ":referrer",
        "http-version": ":http-version"
    }
`, { stream: createWriteStream(join(logsDir, 'access.log'), { flags: 'a' }) });
