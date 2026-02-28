import { withCors } from '../lib/cors.js';

function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
}

export default withCors(handler);
