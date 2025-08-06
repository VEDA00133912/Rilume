const cron = require('node-cron');
const Omikuji = require('../../models/omikuji');

cron.schedule('0 15 * * *', async () => {
  try {
    await Omikuji.deleteMany({});
    console.log('[OMIKUJI] DBをリセットしました');
  } catch (error) {
    console.error('[OMIKUJI] DBリセットエラー:', error);
  }
});
