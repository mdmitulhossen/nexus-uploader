const MemoryCache = function() {
  this.cache = new Map();
};

MemoryCache.prototype.put = function(key, value, ttl) {
  this.cache.set(key, { value, expires: ttl ? Date.now() + ttl * 1000 : null });
};

MemoryCache.prototype.get = function(key) {
  const item = this.cache.get(key);
  if (!item) return null;
  if (item.expires && Date.now() > item.expires) {
    this.cache.delete(key);
    return null;
  }
  return item.value;
};

MemoryCache.prototype.del = function(key) {
  return this.cache.delete(key);
};

MemoryCache.prototype.clear = function() {
  this.cache.clear();
};

module.exports = MemoryCache;