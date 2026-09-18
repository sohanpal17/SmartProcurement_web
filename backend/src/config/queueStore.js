// In-memory & synchronized queue store for SmartProcure tokens
class QueueStore {
  constructor() {
    this.bookings = [
      {
        id: "booking-1038",
        token_number: "TBR-1038",
        farmer_name: "Vikas Shinde",
        display_farmer_id: "FMR-7128912338",
        commodity_name: "Soybean",
        quantity_quintals: 45,
        mandi_id: "turbhe",
        time_range: "07:00 AM – 10:00 AM",
        status: "Confirmed",
      },
      {
        id: "booking-1039",
        token_number: "TBR-1039",
        farmer_name: "Namdeo Kadam",
        display_farmer_id: "FMR-7128912339",
        commodity_name: "Cotton",
        quantity_quintals: 38,
        mandi_id: "turbhe",
        time_range: "12:00 PM – 03:00 PM",
        status: "Confirmed",
      },
      {
        id: "booking-1040",
        token_number: "TBR-1040",
        farmer_name: "Baburao More",
        display_farmer_id: "FMR-7128912340",
        commodity_name: "Paddy",
        quantity_quintals: 52,
        mandi_id: "turbhe",
        time_range: "07:00 AM – 10:00 AM",
        status: "Confirmed",
      },
      {
        id: "booking-1041",
        token_number: "TBR-1041",
        farmer_name: "Digambar Deshmukh",
        display_farmer_id: "FMR-7128912345",
        commodity_name: "Soybean",
        quantity_quintals: 50,
        mandi_id: "turbhe",
        time_range: "07:00 AM – 10:00 AM",
        status: "Confirmed",
      },
      {
        id: "booking-1042",
        token_number: "TBR-1042",
        farmer_name: "Santosh Deshmukh",
        display_farmer_id: "FMR-7128912346",
        commodity_name: "Cotton",
        quantity_quintals: 40,
        mandi_id: "turbhe",
        time_range: "07:00 AM – 10:00 AM",
        status: "Confirmed",
      },
      {
        id: "booking-1043",
        token_number: "TBR-1043",
        farmer_name: "Ananda Shinde",
        display_farmer_id: "FMR-7128912347",
        commodity_name: "Tur Dal",
        quantity_quintals: 35,
        mandi_id: "turbhe",
        time_range: "12:00 PM – 03:00 PM",
        status: "Confirmed",
      },
      {
        id: "booking-1044",
        token_number: "TBR-1044",
        farmer_name: "Ganesh Pawar",
        display_farmer_id: "FMR-7128912348",
        commodity_name: "Paddy",
        quantity_quintals: 60,
        mandi_id: "turbhe",
        time_range: "12:00 PM – 03:00 PM",
        status: "Confirmed",
      },
    ];

    const completedIds = ["booking-1038", "booking-1039", "booking-1040"];
    this.queueRecords = this.bookings.map((b) => {
      const isCompleted = completedIds.includes(b.id);
      return {
        id: `q-${b.id}`,
        booking_id: b.id,
        token_number: b.token_number,
        mandi_id: b.mandi_id,
        current_stage: isCompleted ? 5 : 1,
        people_ahead: isCompleted ? 0 : 2,
        estimated_wait_mins: isCompleted ? 0 : 30,
        updated_at: new Date().toISOString(),
        bookings: b,
      };
    });

    // Explicitly purge token 1045 if added previously
    this.removeBookingOrToken("TBR-1045");
    this.removeBookingOrToken("1045");
    this.removeBookingOrToken("BK-1045");
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
    if (!tokenNumber) return null;
    const searchToken = tokenNumber.trim().toLowerCase();
    const record = this.queueRecords.find((q) => (q.token_number || '').toLowerCase() === searchToken);
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

  removeBookingOrToken(searchKey) {
    if (!searchKey) return;
    const key = String(searchKey).trim().toLowerCase();
    this.bookings = this.bookings.filter(
      (b) => (b.id || '').toLowerCase() !== key && (b.token_number || '').toLowerCase() !== key && (b.booking_ref || '').toLowerCase() !== key
    );
    this.queueRecords = this.queueRecords.filter(
      (q) => (q.id || '').toLowerCase() !== key && (q.booking_id || '').toLowerCase() !== key && (q.token_number || '').toLowerCase() !== key
    );
  }
}

const queueStore = new QueueStore();
module.exports = queueStore;
