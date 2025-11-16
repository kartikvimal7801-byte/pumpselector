// Database module for storing all pump selector backend information
// Uses IndexedDB for client-side storage
// All backend operations are hidden from users

class PumpDatabase {
  constructor() {
    this.dbName = 'PumpSelectorDB';
    this.dbVersion = 2; // Incremented for new features
    this.db = null;
    this.logs = []; // Internal logging (not exposed to users)
    this.syncQueue = []; // Background sync queue
    this.isProcessing = false;
  }

  // ========== INTERNAL LOGGING (Backend Only) ==========
  _log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data) : null
    };
    this.logs.push(logEntry);
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    // Only log errors to console (users won't see this)
    if (level === 'error') {
      console.error(`[DB ${level.toUpperCase()}]`, message, data || '');
    }
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        // Store for pump selections (selection.html)
        if (!db.objectStoreNames.contains('pumpSelections')) {
          const selectionStore = db.createObjectStore('pumpSelections', {
            keyPath: 'id',
            autoIncrement: true
          });
          selectionStore.createIndex('timestamp', 'timestamp', { unique: false });
          selectionStore.createIndex('purpose', 'purpose', { unique: false });
          selectionStore.createIndex('mode', 'mode', { unique: false });
        }

        // Store for pump problems (Wealthness.html)
        if (!db.objectStoreNames.contains('pumpProblems')) {
          const problemStore = db.createObjectStore('pumpProblems', {
            keyPath: 'id',
            autoIncrement: true
          });
          problemStore.createIndex('timestamp', 'timestamp', { unique: false });
          problemStore.createIndex('pumpType', 'pumpType', { unique: false });
          problemStore.createIndex('problem', 'problem', { unique: false });
        }

        // Store for pump recommendations
        if (!db.objectStoreNames.contains('pumpRecommendations')) {
          const recommendationStore = db.createObjectStore('pumpRecommendations', {
            keyPath: 'id',
            autoIncrement: true
          });
          recommendationStore.createIndex('timestamp', 'timestamp', { unique: false });
          recommendationStore.createIndex('selectionId', 'selectionId', { unique: false });
        }

        // Store for analytics/statistics
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', {
            keyPath: 'id',
            autoIncrement: true
          });
          analyticsStore.createIndex('date', 'date', { unique: false });
          analyticsStore.createIndex('type', 'type', { unique: false });
        }

        // NEW: Store for internal logs (backend only)
        if (!db.objectStoreNames.contains('internalLogs')) {
          const logStore = db.createObjectStore('internalLogs', {
            keyPath: 'id',
            autoIncrement: true
          });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
          logStore.createIndex('level', 'level', { unique: false });
        }

        // NEW: Store for sync queue (background operations)
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        // NEW: Store for data integrity checks
        if (!db.objectStoreNames.contains('integrityChecks')) {
          const integrityStore = db.createObjectStore('integrityChecks', {
            keyPath: 'id',
            autoIncrement: true
          });
          integrityStore.createIndex('timestamp', 'timestamp', { unique: false });
          integrityStore.createIndex('checkType', 'checkType', { unique: false });
        }

        this._log('info', 'Database schema upgraded', { oldVersion, newVersion: this.dbVersion });
      };
    });
  }

  // ========== DATA VALIDATION (Backend) ==========
  _validateSelectionData(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { valid: false, errors };
    }

    // Validate required fields based on mode
    const mode = data.mode || 'simple';
    if (mode === 'simple') {
      if (!data.purpose) errors.push('Purpose is required');
      if (!data.location && data.purpose !== 'construction') errors.push('Location is required');
    } else if (mode === 'advanced') {
      if (!data.purpose) errors.push('Purpose is required');
      if (!data.hp) errors.push('HP is required in advanced mode');
    }

    // Sanitize string inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return '';
      return str.trim().substring(0, 500); // Limit length
    };

    // Sanitize all string fields
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = sanitizeString(data[key]);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      sanitized: data
    };
  }

  _validateProblemData(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { valid: false, errors };
    }

    if (!data.pumpType) errors.push('Pump type is required');
    if (!data.problem) errors.push('Problem description is required');

    // Sanitize
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return '';
      return str.trim().substring(0, 500);
    };

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = sanitizeString(data[key]);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      sanitized: data
    };
  }

  // ========== SAVE PUMP SELECTION DATA (Enhanced) ==========
  async saveSelection(data) {
    if (!this.db) await this.init();

    try {
      // Validate and sanitize data (backend operation)
      const validation = this._validateSelectionData(data);
      if (!validation.valid) {
        this._log('error', 'Selection validation failed', validation.errors);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const sanitizedData = validation.sanitized;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['pumpSelections', 'analytics'], 'readwrite');
        const store = transaction.objectStore('pumpSelections');
        const analyticsStore = transaction.objectStore('analytics');

        const selectionData = {
          ...sanitizedData,
          timestamp: new Date().toISOString(),
          mode: sanitizedData.mode || 'simple',
          _metadata: {
            userAgent: sanitizedData.userAgent || navigator.userAgent,
            savedAt: Date.now()
          }
        };

        // Remove userAgent from main data (keep in metadata)
        delete selectionData.userAgent;

        const request = store.add(selectionData);

        request.onsuccess = async () => {
          const selectionId = request.result;
          this._log('info', 'Selection saved', { id: selectionId, mode: selectionData.mode });

          // Track analytics in background (user won't see this)
          try {
            await this._trackAnalytics('selection', {
              mode: selectionData.mode,
              purpose: selectionData.purpose,
              selectionId
            });
          } catch (analyticsError) {
            this._log('error', 'Analytics tracking failed', analyticsError);
            // Don't fail the save if analytics fails
          }

          resolve(selectionId);
        };

        request.onerror = () => {
          const error = request.error;
          this._log('error', 'Failed to save selection', error);
          reject(error);
        };
      });
    } catch (error) {
      this._log('error', 'Selection save error', error);
      throw error;
    }
  }

  // ========== SAVE PUMP PROBLEM DATA (Enhanced) ==========
  async saveProblem(data) {
    if (!this.db) await this.init();

    try {
      // Validate and sanitize data (backend operation)
      const validation = this._validateProblemData(data);
      if (!validation.valid) {
        this._log('error', 'Problem validation failed', validation.errors);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const sanitizedData = validation.sanitized;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['pumpProblems', 'analytics'], 'readwrite');
        const store = transaction.objectStore('pumpProblems');

        const problemData = {
          ...sanitizedData,
          timestamp: new Date().toISOString(),
          _metadata: {
            userAgent: sanitizedData.userAgent || navigator.userAgent,
            savedAt: Date.now()
          }
        };

        // Remove userAgent from main data
        delete problemData.userAgent;

        const request = store.add(problemData);

        request.onsuccess = async () => {
          const problemId = request.result;
          this._log('info', 'Problem saved', { id: problemId, pumpType: problemData.pumpType });

          // Track analytics in background
          try {
            await this._trackAnalytics('problem', {
              pumpType: problemData.pumpType,
              problem: problemData.problem,
              problemId
            });
          } catch (analyticsError) {
            this._log('error', 'Analytics tracking failed', analyticsError);
          }

          resolve(problemId);
        };

        request.onerror = () => {
          const error = request.error;
          this._log('error', 'Failed to save problem', error);
          reject(error);
        };
      });
    } catch (error) {
      this._log('error', 'Problem save error', error);
      throw error;
    }
  }

  // ========== SAVE RECOMMENDATION DATA (Enhanced) ==========
  async saveRecommendation(selectionId, recommendations) {
    if (!this.db) await this.init();

    try {
      if (!selectionId || !recommendations) {
        throw new Error('Selection ID and recommendations are required');
      }

      // Validate recommendations structure
      if (!Array.isArray(recommendations.matches) && typeof recommendations !== 'object') {
        this._log('warn', 'Invalid recommendations format', recommendations);
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['pumpRecommendations', 'analytics'], 'readwrite');
        const store = transaction.objectStore('pumpRecommendations');

        const recommendationData = {
          selectionId: selectionId,
          recommendations: recommendations,
          timestamp: new Date().toISOString(),
          _metadata: {
            matchCount: recommendations.matches ? recommendations.matches.length : 0,
            savedAt: Date.now()
          }
        };

        const request = store.add(recommendationData);

        request.onsuccess = async () => {
          const recId = request.result;
          this._log('info', 'Recommendation saved', { id: recId, selectionId });

          // Track analytics in background
          try {
            await this._trackAnalytics('recommendation', {
              selectionId,
              matchCount: recommendationData._metadata.matchCount,
              recommendationId: recId
            });
          } catch (analyticsError) {
            this._log('error', 'Analytics tracking failed', analyticsError);
          }

          resolve(recId);
        };

        request.onerror = () => {
          const error = request.error;
          this._log('error', 'Failed to save recommendation', error);
          reject(error);
        };
      });
    } catch (error) {
      this._log('error', 'Recommendation save error', error);
      throw error;
    }
  }

  // Get all selections
  async getAllSelections() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pumpSelections'], 'readonly');
      const store = transaction.objectStore('pumpSelections');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all problems
  async getAllProblems() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pumpProblems'], 'readonly');
      const store = transaction.objectStore('pumpProblems');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get recommendations by selection ID
  async getRecommendationsBySelection(selectionId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pumpRecommendations'], 'readonly');
      const store = transaction.objectStore('pumpRecommendations');
      const index = store.index('selectionId');
      const request = index.getAll(selectionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ========== ANALYTICS TRACKING (Backend Only) ==========
  async _trackAnalytics(type, data) {
    if (!this.db) await this.init();

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');

        const today = new Date().toISOString().split('T')[0];
        const analyticsData = {
          type,
          date: today,
          data,
          timestamp: new Date().toISOString()
        };

        const request = store.add(analyticsData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this._log('error', 'Analytics save failed', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this._log('error', 'Analytics tracking error', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  // ========== GET STATISTICS/ANALYTICS (Enhanced) ==========
  async getStatistics() {
    if (!this.db) await this.init();

    try {
      const [selections, problems, recommendations, analytics] = await Promise.all([
        this.getAllSelections(),
        this.getAllProblems(),
        new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['pumpRecommendations'], 'readonly');
          const store = transaction.objectStore('pumpRecommendations');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['analytics'], 'readonly');
          const store = transaction.objectStore('analytics');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ]);

      // Process analytics data (backend calculation)
      const analyticsByType = {};
      const analyticsByDate = {};
      
      analytics.forEach(entry => {
        // Group by type
        if (!analyticsByType[entry.type]) {
          analyticsByType[entry.type] = 0;
        }
        analyticsByType[entry.type]++;

        // Group by date
        if (!analyticsByDate[entry.date]) {
          analyticsByDate[entry.date] = 0;
        }
        analyticsByDate[entry.date]++;
      });

      // Calculate mode distribution
      const modeDistribution = {};
      selections.forEach(sel => {
        const mode = sel.mode || 'simple';
        modeDistribution[mode] = (modeDistribution[mode] || 0) + 1;
      });

      // Calculate purpose distribution
      const purposeDistribution = {};
      selections.forEach(sel => {
        const purpose = sel.purpose || 'unknown';
        purposeDistribution[purpose] = (purposeDistribution[purpose] || 0) + 1;
      });

      // Calculate problem type distribution
      const problemTypeDistribution = {};
      problems.forEach(prob => {
        const pumpType = prob.pumpType || 'unknown';
        problemTypeDistribution[pumpType] = (problemTypeDistribution[pumpType] || 0) + 1;
      });

      return {
        totalSelections: selections.length,
        totalProblems: problems.length,
        totalRecommendations: recommendations.length,
        totalAnalytics: analytics.length,
        recentSelections: selections.slice(-10),
        recentProblems: problems.slice(-10),
        // Backend calculated statistics (not visible to users)
        _internal: {
          analyticsByType,
          analyticsByDate,
          modeDistribution,
          purposeDistribution,
          problemTypeDistribution,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      this._log('error', 'Statistics calculation error', error);
      throw error;
    }
  }

  // Export all data (for backup or transfer)
  async exportAllData() {
    const [selections, problems, recommendations] = await Promise.all([
      this.getAllSelections(),
      this.getAllProblems(),
      new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['pumpRecommendations'], 'readonly');
        const store = transaction.objectStore('pumpRecommendations');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    ]);

    return {
      selections,
      problems,
      recommendations,
      exportDate: new Date().toISOString()
    };
  }

  // ========== DATA INTEGRITY CHECKS (Backend) ==========
  async _checkDataIntegrity() {
    if (!this.db) await this.init();

    try {
      const integrityResults = {
        timestamp: new Date().toISOString(),
        checks: {},
        issues: []
      };

      // Check for orphaned recommendations
      const [selections, recommendations] = await Promise.all([
        this.getAllSelections(),
        new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['pumpRecommendations'], 'readonly');
          const store = transaction.objectStore('pumpRecommendations');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ]);

      const selectionIds = new Set(selections.map(s => s.id));
      const orphanedRecs = recommendations.filter(rec => !selectionIds.has(rec.selectionId));
      
      integrityResults.checks.orphanedRecommendations = orphanedRecs.length;
      if (orphanedRecs.length > 0) {
        integrityResults.issues.push({
          type: 'orphaned_recommendations',
          count: orphanedRecs.length,
          details: orphanedRecs.map(r => r.id)
        });
      }

      // Check for missing timestamps
      const missingTimestamps = selections.filter(s => !s.timestamp).length;
      integrityResults.checks.missingTimestamps = missingTimestamps;
      if (missingTimestamps > 0) {
        integrityResults.issues.push({
          type: 'missing_timestamps',
          count: missingTimestamps
        });
      }

      // Save integrity check result
      try {
        const transaction = this.db.transaction(['integrityChecks'], 'readwrite');
        const store = transaction.objectStore('integrityChecks');
        const checkData = {
          ...integrityResults,
          checkType: 'full',
          issuesFound: integrityResults.issues.length
        };
        store.add(checkData);
      } catch (err) {
        this._log('error', 'Failed to save integrity check', err);
      }

      this._log('info', 'Data integrity check completed', integrityResults);
      return integrityResults;
    } catch (error) {
      this._log('error', 'Data integrity check failed', error);
      throw error;
    }
  }

  // ========== BACKGROUND MAINTENANCE (Backend) ==========
  async _performMaintenance() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      this._log('info', 'Starting background maintenance');

      // Run integrity checks
      await this._checkDataIntegrity();

      // Clean old logs (keep last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      try {
        const transaction = this.db.transaction(['internalLogs'], 'readwrite');
        const store = transaction.objectStore('internalLogs');
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(new Date(thirtyDaysAgo).toISOString());
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (err) {
        this._log('error', 'Log cleanup failed', err);
      }

      // Process sync queue
      await this._processSyncQueue();

      this._log('info', 'Background maintenance completed');
    } catch (error) {
      this._log('error', 'Maintenance error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // ========== SYNC QUEUE PROCESSING (Backend) ==========
  async _processSyncQueue() {
    if (!this.db) await this.init();

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = async () => {
        const pendingItems = request.result;
        if (pendingItems.length === 0) return;

        for (const item of pendingItems) {
          try {
            // Process sync item (placeholder for future sync operations)
            item.status = 'processed';
            item.processedAt = new Date().toISOString();
            
            const updateRequest = store.put(item);
            updateRequest.onsuccess = () => {
              this._log('info', 'Sync item processed', { id: item.id });
            };
          } catch (err) {
            item.status = 'failed';
            item.error = err.message;
            store.put(item);
            this._log('error', 'Sync item failed', { id: item.id, error: err });
          }
        }
      };
    } catch (error) {
      this._log('error', 'Sync queue processing error', error);
    }
  }

  // ========== AUTO-MAINTENANCE SCHEDULER (Backend) ==========
  _startMaintenanceScheduler() {
    // Run maintenance every 24 hours
    setInterval(() => {
      this._performMaintenance().catch(err => {
        this._log('error', 'Scheduled maintenance failed', err);
      });
    }, 24 * 60 * 60 * 1000);

    // Also run on page visibility change (when user returns)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this._performMaintenance().catch(err => {
            this._log('error', 'Visibility-based maintenance failed', err);
          });
        }
      });
    }

    this._log('info', 'Maintenance scheduler started');
  }

  // ========== CLEAR ALL DATA (Enhanced) ==========
  async clearAllData() {
    if (!this.db) await this.init();

    try {
      const stores = ['pumpSelections', 'pumpProblems', 'pumpRecommendations', 'analytics', 'internalLogs', 'syncQueue', 'integrityChecks'];
      const promises = stores.map(storeName => {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const objectStore = transaction.objectStore(storeName);
          const request = objectStore.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

      await Promise.all(promises);
      this.logs = []; // Clear in-memory logs
      this._log('info', 'All data cleared from database');
    } catch (error) {
      this._log('error', 'Clear data error', error);
      throw error;
    }
  }

  // ========== GET INTERNAL LOGS (Backend Only - Not Exposed) ==========
  _getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    return filteredLogs.slice(-limit);
  }
}

// Create global database instance
const pumpDB = new PumpDatabase();

// Initialize on load and start background processes
if (typeof window !== 'undefined') {
  pumpDB.init()
    .then(() => {
      // Start background maintenance scheduler (users won't see this)
      pumpDB._startMaintenanceScheduler();
      
      // Run initial maintenance after a delay
      setTimeout(() => {
        pumpDB._performMaintenance().catch(err => {
          // Silently handle - users don't need to know
        });
      }, 5000);
    })
    .catch(err => {
      // Only log to console (backend error, user won't see)
      console.error('[DB] Initialization error:', err);
    });
}

