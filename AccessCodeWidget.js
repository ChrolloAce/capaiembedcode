import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

class AccessCodeWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.firebaseInitialized = false;
  }

  generateUniqueCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  initializeFirebase() {
    // Get configuration from attributes or use default values
    const firebaseConfig = {
      apiKey: this.getAttribute('api-key') || "",
      authDomain: this.getAttribute('auth-domain') || "",
      projectId: this.getAttribute('project-id') || "",
      storageBucket: this.getAttribute('storage-bucket') || "",
      messagingSenderId: this.getAttribute('messaging-sender-id') || "",
      appId: this.getAttribute('app-id') || ""
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.firebaseInitialized = true;
  }

  async connectedCallback() {
    // Initialize CSS
    const style = document.createElement('style');
    style.textContent = `
      .access-code-container {
        margin: 20px;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .access-code-display {
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 2px;
        margin: 20px 0;
        padding: 15px;
        background-color: #fff;
        border: 1px dashed #ccc;
        border-radius: 4px;
      }
      .access-code-loading {
        padding: 20px;
        text-align: center;
        font-style: italic;
        color: #666;
      }
      .access-code-error {
        padding: 15px;
        color: #d32f2f;
        background-color: #ffebee;
        border-radius: 4px;
        margin: 10px 0;
        text-align: center;
      }
      .access-code-instructions {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Show loading state
    const loadingEl = document.createElement('div');
    loadingEl.className = 'access-code-loading';
    loadingEl.textContent = 'Generating your access code...';
    this.shadowRoot.appendChild(loadingEl);

    try {
      // Initialize Firebase if not already initialized
      if (!this.firebaseInitialized) {
        this.initializeFirebase();
      }

      // Get necessary attributes
      const userId = this.getAttribute('user-id');
      const purchaseId = this.getAttribute('purchase-id');

      if (!userId || !purchaseId) {
        throw new Error('Missing user ID or purchase ID');
      }

      // Check if a code already exists
      const codesRef = collection(this.db, 'purchase_codes');
      const q = query(codesRef, where('purchaseId', '==', purchaseId));
      const querySnapshot = await getDocs(q);

      let accessCode;
      if (!querySnapshot.empty) {
        // Code already exists, retrieve it
        accessCode = querySnapshot.docs[0].data().code;
      } else {
        // Generate a new code
        accessCode = this.generateUniqueCode();
        
        // Save to Firebase
        await addDoc(collection(this.db, 'purchase_codes'), {
          code: accessCode,
          userId: userId,
          purchaseId: purchaseId,
          createdAt: new Date(),
          used: false
        });
      }

      // Remove loading and show the code
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(style);

      const container = document.createElement('div');
      container.className = 'access-code-container';
      
      const heading = document.createElement('h3');
      heading.textContent = 'Your Access Code';
      
      const codeDisplay = document.createElement('div');
      codeDisplay.className = 'access-code-display';
      codeDisplay.textContent = accessCode;
      
      const instructions = document.createElement('p');
      instructions.className = 'access-code-instructions';
      instructions.textContent = 'Save this code in a safe place. You\'ll need it to access your purchase.';
      
      container.appendChild(heading);
      container.appendChild(codeDisplay);
      container.appendChild(instructions);
      this.shadowRoot.appendChild(container);
      
    } catch (err) {
      console.error('Error generating access code:', err);
      
      // Show error message
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(style);
      
      const errorEl = document.createElement('div');
      errorEl.className = 'access-code-error';
      errorEl.textContent = 'Failed to generate access code. Please contact support.';
      this.shadowRoot.appendChild(errorEl);
    }
  }
}

// Define the custom element
customElements.define('access-code-widget', AccessCodeWidget);

export default AccessCodeWidget; 