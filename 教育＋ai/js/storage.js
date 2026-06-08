(function () {
  const key = "simututor-progress-v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch (error) {
      return {};
    }
  }

  function write(data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  window.SimuStorage = {
    get(lab) {
      return read()[lab] || {};
    },
    set(lab, value) {
      const data = read();
      data[lab] = { ...data[lab], ...value, updatedAt: new Date().toISOString() };
      write(data);
      return data[lab];
    },
    increment(lab, field) {
      const current = this.get(lab);
      const next = Number(current[field] || 0) + 1;
      return this.set(lab, { [field]: next });
    }
  };
})();
