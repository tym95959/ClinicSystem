// config.js - Device Authentication Configuration
// This file contains the annual device password configuration

const CONFIG = {
    // Annual device password (rotates yearly)
    // This password is required once per year to authorise the device/workstation
    deviceAnnualPassword: "ClinicSecure@2026",
    
    // Optional: Password expiry notice message
    expiryNotice: "This password is valid for 365 days from activation"
};

// Export for use in other files (global scope)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}