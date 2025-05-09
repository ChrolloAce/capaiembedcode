/**
 * Access Code Generator
 * A simple script to generate and manage access codes using Firebase
 */

class AccessCodeGenerator {
  constructor(options) {
    this.options = options || {};
    this.containerId = options.containerId || 'access-code-container';
    this.firebaseConfig = options.firebaseConfig || {};
    this.userId = options.userId;
    this.purchaseId = options.purchaseId;
    this.db = null;
    this.accessCode = null;
  }

  generateUniqueCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    // Generate a 16-character code like "3ZW4U2W2MB5ERU4T"
    for (let i = 0; i < 16; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  initializeFirebase() {
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not loaded. Make sure to include Firebase scripts before this one.');
      return false;
    }

    try {
      // Check if Firebase is already initialized
      if (firebase.apps.length === 0) {
        firebase.initializeApp(this.firebaseConfig);
      }
      this.db = firebase.firestore();
      return true;
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      return false;
    }
  }

  showLoading() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px; text-align: center; font-style: italic; color: #666;">
        Generating your access code...
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; background-color: #ffebee; border-radius: 4px; margin: 10px 0; text-align: center;">
        ${message || 'Failed to generate access code. Please contact support.'}
      </div>
    `;
  }

  copyToClipboard() {
    if (!this.accessCode) return;
    
    navigator.clipboard.writeText(this.accessCode)
      .then(() => {
        const copyButton = document.getElementById('copy-button');
        copyButton.textContent = 'Copied!';
        copyButton.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.style.backgroundColor = '#0366d6';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  showCode(accessCode) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.accessCode = accessCode;

    container.innerHTML = `
      <div style="margin: 20px; padding: 20px; border-radius: 8px; background-color: #f9f9f9; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center;">
        <h3 style="margin-top: 0;">Your Access Code</h3>
        <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px; margin: 20px 0; padding: 15px; background-color: #fff; border: 1px dashed #ccc; border-radius: 4px;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${accessCode}</span>
          <button id="copy-button" style="margin-left: 10px; padding: 8px 12px; background-color: #0366d6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s;">Copy</button>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
          Save this code in a safe place. You'll need it to access your purchase.
        </p>
      </div>
    `;

    // Add click event listener to the copy button
    document.getElementById('copy-button').addEventListener('click', () => this.copyToClipboard());
  }

  async checkExistingCode() {
    try {
      if (!this.userId || !this.purchaseId) {
        throw new Error('Missing user ID or purchase ID');
      }

      // Check if a code already exists for this purchase
      const querySnapshot = await this.db.collection('purchase_codes')
        .where('purchaseId', '==', this.purchaseId)
        .get();

      let accessCode;
      if (!querySnapshot.empty) {
        // Code already exists, retrieve it
        accessCode = querySnapshot.docs[0].data().code;
      } else {
        // Generate a new code
        accessCode = this.generateUniqueCode();

        // Save to Firebase
        await this.db.collection('purchase_codes').add({
          code: accessCode,
          userId: this.userId,
          purchaseId: this.purchaseId,
          createdAt: new Date(),
          used: false
        });
      }

      return accessCode;
    } catch (err) {
      console.error('Error generating access code:', err);
      throw err;
    }
  }

  async init() {
    // Show loading state
    this.showLoading();

    // Validate container
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID '${this.containerId}' not found.`);
      return;
    }

    // Initialize Firebase
    if (!this.initializeFirebase()) {
      this.showError('Failed to initialize Firebase. Please try again later.');
      return;
    }

    // Generate or retrieve access code
    try {
      const accessCode = await this.checkExistingCode();
      this.showCode(accessCode);
    } catch (err) {
      this.showError(err.message || 'Failed to generate access code.');
    }
  }
}

// Make available globally
window.AccessCodeGenerator = AccessCodeGenerator; 