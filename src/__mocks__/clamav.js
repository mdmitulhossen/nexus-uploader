const ClamAV = {
  createScanner: () => ({
    scan: async (buffer) => {
      // Mock implementation - always return clean
      return { isClean: true };
    }
  })
};

module.exports = ClamAV;