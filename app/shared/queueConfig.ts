import Queue from 'bull';

const redis_port = process.env.REDIS_PORT || '6379';

const redis_host = process.env.REDIS_HOST || 'localhost';
console.log('redis_host', redis_host);
console.log('redis_port', redis_port);

export const REDIS_CONFIG = {
  redis: {
    port: redis_port,
    host: redis_host
  }
};

export const updateQueue = new Queue('tweet-updates', REDIS_CONFIG);
console.log('Queue created');