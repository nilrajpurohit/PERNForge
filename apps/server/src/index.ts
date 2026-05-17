import app from './app.js';
import { config } from './config/env.js';

const port = Number(config.PORT || 4000);

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
