const { Client } = require('pg');
const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  user: 'postgres.cynrkcrjcxpyiuagyvxj',
  password: 'sb_publishable_63nVtmzyXYHGi1lLJWxwxw_6rY8XeKh',
  database: 'postgres',
  port: 6543,
});
client.connect().then(() => {
  console.log('Connected');
  client.end();
}).catch(err => {
  console.error('Error:', err.message);
});
