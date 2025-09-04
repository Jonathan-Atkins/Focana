const STORAGE_KEY = 'focusSessions';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export const FocusSession = {
  async list(order = '-created_date', limit = 50) {
    const sessions = loadSessions();
    sessions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return sessions.slice(0, limit);
  },
  async create(data) {
    const sessions = loadSessions();
    const session = {
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
      ...data
    };
    sessions.push(session);
    saveSessions(sessions);
    return session;
  },
  async update(id, updates) {
    const sessions = loadSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      saveSessions(sessions);
      return sessions[index];
    }
    return null;
  }
};

export const ParkingLotItem = {
  async list() {
    return [];
  }
};

export const User = {};
