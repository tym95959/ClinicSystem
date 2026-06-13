// Device Authorization Module - Survives cache clearing
const DeviceAuth = {
    STORAGE_KEY: 'hopedental_device_auth',
    
    // Get expiry date for authorization
    getExpiryDate() {
        const date = new Date();
        date.setDate(date.getDate() + window.DEVICE_CONFIG.authExpiryDays);
        return date.toISOString();
    },
    
    // Save authorization to multiple storage locations (cache-safe)
    saveAuthorization() {
        const authData = {
            authorized: true,
            authorizedAt: new Date().toISOString(),
            expiresAt: this.getExpiryDate(),
            deviceId: this.generateDeviceId()
        };
        
        const authString = JSON.stringify(authData);
        
        // 1. localStorage
        try { localStorage.setItem(this.STORAGE_KEY, authString); } catch(e) {}
        
        // 2. Cookie - survives cache clearing!
        try {
            document.cookie = `${this.STORAGE_KEY}=${encodeURIComponent(authString)}; expires=${authData.expiresAt}; path=/; SameSite=Lax`;
        } catch(e) {}
        
        // 3. sessionStorage backup
        try { sessionStorage.setItem(this.STORAGE_KEY, authString); } catch(e) {}
        
        // 4. IndexedDB backup
        this.saveToIndexedDB(authData);
        
        console.log('Device authorization saved (cache-safe)');
        return true;
    },
    
    // Save to IndexedDB for extra persistence
    async saveToIndexedDB(authData) {
        try {
            const request = indexedDB.open('HopeDentalAuth', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('auth')) {
                    db.createObjectStore('auth', { keyPath: 'key' });
                }
            };
            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(['auth'], 'readwrite');
                const store = transaction.objectStore('auth');
                store.put({ key: 'deviceAuth', value: authData });
                db.close();
            };
        } catch(e) { console.warn('IndexedDB not available'); }
    },
    
    // Check if device is authorized
    async isAuthorized() {
        // Check Cookie first (most persistent)
        const cookieMatch = document.cookie.match(new RegExp('(^| )' + this.STORAGE_KEY + '=([^;]+)'));
        if (cookieMatch) {
            try {
                const authData = JSON.parse(decodeURIComponent(cookieMatch[2]));
                if (authData.authorized && new Date(authData.expiresAt) > new Date()) {
                    return true;
                }
            } catch(e) {}
        }
        
        // Check localStorage
        try {
            const localData = localStorage.getItem(this.STORAGE_KEY);
            if (localData) {
                const authData = JSON.parse(localData);
                if (authData.authorized && new Date(authData.expiresAt) > new Date()) {
                    return true;
                }
            }
        } catch(e) {}
        
        // Check IndexedDB
        try {
            const authData = await this.loadFromIndexedDB();
            if (authData && authData.authorized && new Date(authData.expiresAt) > new Date()) {
                return true;
            }
        } catch(e) {}
        
        return false;
    },
    
    // Load from IndexedDB
    async loadFromIndexedDB() {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('HopeDentalAuth', 1);
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('auth')) {
                        resolve(null);
                        return;
                    }
                    const transaction = db.transaction(['auth'], 'readonly');
                    const store = transaction.objectStore('auth');
                    const getRequest = store.get('deviceAuth');
                    getRequest.onsuccess = () => {
                        resolve(getRequest.result ? getRequest.result.value : null);
                        db.close();
                    };
                    getRequest.onerror = () => {
                        resolve(null);
                        db.close();
                    };
                };
                request.onerror = () => resolve(null);
            } catch(e) {
                resolve(null);
            }
        });
    },
    
    // Generate unique device ID
    generateDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substr(2, 16);
            try { localStorage.setItem('device_id', deviceId); } catch(e) {}
        }
        return deviceId;
    },
    
    // Verify device password
    async verifyDevicePassword(password) {
        return password === window.DEVICE_CONFIG.deviceMasterPassword;
    },
    
    // Clear device authorization
    clearAuthorization() {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch(e) {}
        try { sessionStorage.removeItem(this.STORAGE_KEY); } catch(e) {}
        try { 
            document.cookie = `${this.STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } catch(e) {}
        console.log('Device authorization cleared');
    },
    
    // Get remaining time
    getRemainingTime() {
        try {
            const cookieMatch = document.cookie.match(new RegExp('(^| )' + this.STORAGE_KEY + '=([^;]+)'));
            if (cookieMatch) {
                const authData = JSON.parse(decodeURIComponent(cookieMatch[2]));
                const expiry = new Date(authData.expiresAt);
                const now = new Date();
                const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                return daysLeft > 0 ? daysLeft : 0;
            }
        } catch(e) {}
        return 0;
    }
};
