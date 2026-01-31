class Auth {
  constructor() {
    this.storageKey = 'carbnb_api_key';
    this.apiKey = localStorage.getItem(this.storageKey);
  }
  
  isAuthenticated() {
    return !!this.apiKey;
  }
  
  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem(this.storageKey, key);
  }
  
  getApiKey() {
    return this.apiKey;
  }
  
  logout() {
    this.apiKey = null;
    localStorage.removeItem(this.storageKey);
    location.reload();
  }
  
  showLoginScreen() {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
          <h1 style="margin: 0 0 20px 0; color: #333;">🚗 CarBnB Dashboard</h1>
          <p style="color: #666; margin-bottom: 20px;">Enter your access key to continue</p>
          <input 
            type="password" 
            id="apiKeyInput" 
            placeholder="Access Key" 
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;"
          >
          <button 
            onclick="handleLogin()" 
            style="width: 100%; margin-top: 15px; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;"
          >
            Access Dashboard
          </button>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Contact JP if you need an access key
          </p>
        </div>
      </div>
    `;
    
    // Allow Enter key to submit
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    
    // Focus input
    document.getElementById('apiKeyInput').focus();
  }
}

const auth = new Auth();

function handleLogin() {
  const input = document.getElementById('apiKeyInput');
  const key = input.value.trim();
  
  if (!key) {
    alert('Please enter an access key');
    return;
  }
  
  auth.setApiKey(key);
  location.reload();
}