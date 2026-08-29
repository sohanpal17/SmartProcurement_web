// In-memory & synchronized queue store for SmartProcure tokens
class QueueStore {
  constructor() {
    this.bookings = [];
    this.queueRecords = [];
  }

  addBookingAndToken(booking, queueRecord) {
    this.bookings.unshift(booking);
    this.queueRecords.unshift(queueRecord);
  }

  getQueueRecords(mandiId) {
    if (!mandiId) return this.queueRecords;
    const searchMandi = mandiId.toLowerCase();
    return this.queueRecords.filter(
      (q) => (q.mandi_id || '').toLowerCase() === searchMandi
    );
  }

  updateStage(tokenNumber, newStageIndex) {
    const record = this.queueRecords.find((q) => q.token_number === tokenNumber);
    if (record) {
      record.current_stage = parseInt(newStageIndex);
      let peopleAhead = 0;
      let estimatedWaitMins = 0;
      switch (parseInt(newStageIndex)) {
        case 1: peopleAhead = 5; estimatedWaitMins = 75; break;
        case 2: peopleAhead = 3; estimatedWaitMins = 45; break;
        case 3: peopleAhead = 1; estimatedWaitMins = 15; break;
        case 4: peopleAhead = 0; estimatedWaitMins = 5; break;
        case 5:
        case 6: peopleAhead = 0; estimatedWaitMins = 0; break;
      }
      record.people_ahead = peopleAhead;
      record.estimated_wait_mins = estimatedWaitMins;
      record.updated_at = new Date().toISOString();
      return record;
    }
    return null;
  }
}

const queueStore = new QueueStore();
module.exports = queueStore;
