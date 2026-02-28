import { withCors } from '../lib/cors.js';

function handler(req, res) {
  res.status(200).json({ message: 'Hello from the server CTC test!' });
}

export default withCors(handler);
