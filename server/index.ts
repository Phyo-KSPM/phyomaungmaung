import { startServer } from './api-server.ts'

const port = Number(process.env.PORT) || 8787
void startServer(port)
