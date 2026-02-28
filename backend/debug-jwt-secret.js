require('dotenv').config();
const { config } = require('./src/config/env');

console.log('\n===== JWT SECRET DEBUG =====');
console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET);
console.log('process.env.JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log('config.jwtSecret:', config.jwtSecret);
console.log('config.jwtSecret length:', config.jwtSecret?.length);
console.log('Match:', process.env.JWT_SECRET === config.jwtSecret);
console.log('===== END DEBUG =====\n');
