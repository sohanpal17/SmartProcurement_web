// Memory & synchronized officer store for SmartProcure
class OfficerStore {
  constructor() {
    this.officers = [];
  }

  addOfficer(officer) {
    this.officers.unshift(officer);
  }

  getPendingOfficers(mandiId) {
    return this.officers.filter((o) => {
      const matchesMandi = !mandiId || (o.mandi_id || '').toLowerCase() === mandiId.toLowerCase();
      return matchesMandi && !o.is_approved;
    });
  }

  approveOfficer(officerId, approve = true) {
    const officer = this.officers.find((o) => o.id === officerId);
    if (officer) {
      officer.is_approved = approve;
      officer.status = approve ? 'ACTIVE' : 'REJECTED';
      return officer;
    }
    return null;
  }
}

const officerStore = new OfficerStore();
module.exports = officerStore;
