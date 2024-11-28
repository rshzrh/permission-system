import '../shared/queueConfig';
import './tweetPermissionWorker';

console.log('Tweet permission worker started');

// Keep process alive
process.on('uncaughtException', (error) => {
    console.error('[Worker] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Worker] Unhandled Rejection:', reason);
});