/**
 * Token Swap Application
 * 
 * A modern, responsive token swapping interface with real-time price updates,
 * balance management, and intuitive user experience.
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

// ============================================================================
// TYPES AND INTERFACES (TypeScript-like documentation)
// ============================================================================

/**
 * @typedef {Object} TokenData
 * @property {string} symbol - Token symbol (e.g., 'SWTH', 'ETH')
 * @property {string} name - Full token name
 * @property {string} icon - URL to token icon
 */

/**
 * @typedef {Object} SwapState
 * @property {string} fromToken - Currently selected "from" token
 * @property {string} toToken - Currently selected "to" token
 * @property {number} fromAmount - Amount to swap from
 * @property {number} toAmount - Amount to receive
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the swap is valid
 * @property {string} message - User-friendly error message
 * @property {string} code - Error code for programmatic handling
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
  API_ENDPOINTS: {
    PRICES: 'https://interview.switcheo.com/prices.json',
    ICON_BASE_URL: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'
  },
  ANIMATION_DURATION: 300,
  LOADING_TIMEOUT: 2000,
  SUCCESS_DISPLAY_TIME: 3000,
  DEFAULT_SLIPPAGE: 0.5,
  PRECISION: 6,
  MIN_BALANCE: 100,
  MAX_BALANCE: 1100
};

const ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SAME_TOKEN: 'SAME_TOKEN',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INITIALIZATION_ERROR: 'INITIALIZATION_ERROR'
};

// ============================================================================
// APPLICATION STATE MANAGEMENT
// ============================================================================

/**
 * Application state manager
 * Centralizes all application state and provides controlled access
 */
class AppState {
  constructor() {
    this.tokenPrices = new Map();
    this.availableTokens = [];
    this.userBalances = new Map();
    this.selectedFromToken = 'SWTH';
    this.selectedToToken = 'ETH';
    this.isLoading = false;
  }

  /**
   * Update token prices
   * @param {Object} prices - Map of token symbols to prices
   */
  setTokenPrices(prices) {
    this.tokenPrices = new Map(Object.entries(prices));
  }

  /**
   * Get price for a specific token
   * @param {string} symbol - Token symbol
   * @returns {number|null} Token price or null if not available
   */
  getTokenPrice(symbol) {
    return this.tokenPrices.get(symbol) || null;
  }

  /**
   * Update available tokens list
   * @param {TokenData[]} tokens - Array of available tokens
   */
  setAvailableTokens(tokens) {
    this.availableTokens = tokens;
  }

  /**
   * Get available tokens filtered by price availability
   * @returns {TokenData[]} Available tokens with prices
   */
  getAvailableTokens() {
    return this.availableTokens.filter(token => 
      this.tokenPrices.has(token.symbol)
    );
  }

  /**
   * Update user balances
   * @param {Object} balances - Map of token symbols to balances
   */
  setUserBalances(balances) {
    this.userBalances = new Map(Object.entries(balances));
  }

  /**
   * Get user balance for a specific token
   * @param {string} symbol - Token symbol
   * @returns {number} User balance (0 if not found)
   */
  getUserBalance(symbol) {
    return this.userBalances.get(symbol) || 0;
  }

  /**
   * Update selected tokens
   * @param {string} fromToken - New "from" token
   * @param {string} toToken - New "to" token
   */
  setSelectedTokens(fromToken, toToken) {
    this.selectedFromToken = fromToken;
    this.selectedToToken = toToken;
  }

  /**
   * Calculate exchange rate between two tokens
   * @param {string} fromToken - Source token
   * @param {string} toToken - Target token
   * @returns {number|null} Exchange rate or null if prices unavailable
   */
  calculateExchangeRate(fromToken, toToken) {
    const fromPrice = this.getTokenPrice(fromToken);
    const toPrice = this.getTokenPrice(toToken);
    
    if (!fromPrice || !toPrice) return null;
    
    return fromPrice / toPrice;
  }

  /**
   * Calculate amount to receive based on input amount
   * @param {number} fromAmount - Amount to swap
   * @param {string} fromToken - Source token
   * @param {string} toToken - Target token
   * @returns {number|null} Amount to receive or null if calculation impossible
   */
  calculateToAmount(fromAmount, fromToken, toToken) {
    const rate = this.calculateExchangeRate(fromToken, toToken);
    return rate ? fromAmount * rate : null;
  }

  /**
   * Calculate amount to send based on desired receive amount
   * @param {number} toAmount - Desired receive amount
   * @param {string} fromToken - Source token
   * @param {string} toToken - Target token
   * @returns {number|null} Amount to send or null if calculation impossible
   */
  calculateFromAmount(toAmount, fromToken, toToken) {
    const rate = this.calculateExchangeRate(toToken, fromToken);
    return rate ? toAmount * rate : null;
  }
}

// ============================================================================
// DOM ELEMENT MANAGER
// ============================================================================

/**
 * Centralized DOM element management
 * Provides type-safe access to DOM elements and reduces selector duplication
 */
class DOMElementManager {
  constructor() {
    this.elements = this.initializeElements();
  }

  /**
   * Initialize all DOM element references
   * @returns {Object} Map of element IDs to DOM elements
   */
  initializeElements() {
    const elementIds = [
      'swap-form', 'from-amount', 'to-amount', 'from-token-selector',
      'to-token-selector', 'from-token-icon', 'from-token-symbol',
      'to-token-icon', 'to-token-symbol', 'from-balance', 'to-balance',
      'swap-direction-btn', 'swap-button', 'btn-text', 'loading-spinner',
      'exchange-info', 'exchange-rate', 'error-message', 'error-text',
      'token-modal', 'modal-title', 'modal-close', 'token-search', 'token-list'
    ];

    const elements = {};
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element with id '${id}' not found`);
      }
      elements[id] = element;
    });

    return elements;
  }

  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} DOM element or null if not found
   */
  getElement(id) {
    return this.elements[id] || null;
  }

  /**
   * Safely set element text content
   * @param {string} id - Element ID
   * @param {string} text - Text to set
   */
  setText(id, text) {
    const element = this.getElement(id);
    if (element) {
      element.textContent = text;
      console.log(`Set ${id} text to: ${text}`);
    } else {
      console.warn(`Could not set text for element with id: ${id}`);
    }
  }

  /**
   * Safely set element value
   * @param {string} id - Element ID
   * @param {string} value - Value to set
   */
  setValue(id, value) {
    const element = this.getElement(id);
    if (element && element.value !== undefined) {
      element.value = value;
    }
  }

  /**
   * Safely set element display style
   * @param {string} id - Element ID
   * @param {string} display - Display style value
   */
  setDisplay(id, display) {
    const element = this.getElement(id);
    if (element) {
      element.style.display = display;
    }
  }

  /**
   * Safely set element disabled state
   * @param {string} id - Element ID
   * @param {boolean} disabled - Whether to disable the element
   */
  setDisabled(id, disabled) {
    const element = this.getElement(id);
    if (element && element.disabled !== undefined) {
      element.disabled = disabled;
      console.log(`Set ${id} disabled state to: ${disabled}`);
    } else {
      console.warn(`Could not set disabled state for element with id: ${id}`);
    }
  }
}

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

/**
 * Centralized validation logic
 * Provides comprehensive input validation and error handling
 */
class ValidationService {
  /**
   * Validate swap parameters
   * @param {SwapState} swapState - Current swap state
   * @param {AppState} appState - Application state
   * @returns {ValidationResult} Validation result
   */
  static validateSwap(swapState, appState) {
    const { fromAmount, toAmount } = swapState;
    const { selectedFromToken, selectedToToken } = appState;

    // Check for valid amounts
    if (!fromAmount || !toAmount || fromAmount <= 0 || toAmount <= 0) {
      return {
        isValid: false,
        message: 'Please enter valid amounts',
        code: ERROR_CODES.INVALID_AMOUNT
      };
    }

    // Check for same token selection
    if (selectedFromToken === selectedToToken) {
      return {
        isValid: false,
        message: 'Please select different tokens',
        code: ERROR_CODES.SAME_TOKEN
      };
    }

    // Check for sufficient balance
    const userBalance = appState.getUserBalance(selectedFromToken);
    if (fromAmount > userBalance) {
      return {
        isValid: false,
        message: 'Insufficient balance',
        code: ERROR_CODES.INSUFFICIENT_BALANCE
      };
    }

    return {
      isValid: true,
      message: `Swap ${fromAmount.toFixed(CONFIG.PRECISION)} ${selectedFromToken} for ${toAmount.toFixed(CONFIG.PRECISION)} ${selectedToToken}`,
      code: null
    };
  }

  /**
   * Validate token selection
   * @param {string} token - Token symbol to validate
   * @param {AppState} appState - Application state
   * @returns {boolean} Whether token is valid
   */
  static isValidToken(token, appState) {
    return appState.getAvailableTokens().some(t => t.symbol === token);
  }
}

// ============================================================================
// API SERVICE
// ============================================================================

/**
 * Handles all external API interactions
 * Provides centralized error handling and retry logic
 */
class ApiService {
  /**
   * Fetch token prices from API
   * @returns {Promise<Object>} Map of token symbols to prices
   */
  static async fetchTokenPrices() {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.PRICES);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter and transform price data
      const prices = data.reduce((acc, token) => {
        if (token.price && token.currency) {
          acc[token.currency] = parseFloat(token.price);
        }
        return acc;
      }, {});

      console.log('Successfully loaded token prices:', prices);
      return prices;

    } catch (error) {
      console.error('Error fetching token prices:', error);
      
      // Fallback to mock prices for demo purposes
      const fallbackPrices = {
        'SWTH': 0.0001,
        'ETH': 2000,
        'BTC': 40000,
        'USDC': 1,
        'USDT': 1,
        'DAI': 1
      };
      
      console.warn('Using fallback prices due to API error');
      return fallbackPrices;
    }
  }

  /**
   * Simulate swap transaction
   * @param {SwapState} swapState - Swap parameters
   * @returns {Promise<boolean>} Success status
   */
  static async simulateSwap(swapState) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        resolve(success);
      }, CONFIG.LOADING_TIMEOUT);
    });
  }
}

// ============================================================================
// UI SERVICE
// ============================================================================

/**
 * Handles all UI updates and animations
 * Provides consistent user experience across the application
 */
class UIService {
  constructor(domManager) {
    this.dom = domManager;
  }

  /**
   * Update token display in the UI
   * @param {string} type - 'from' or 'to'
   * @param {TokenData} token - Token data to display
   */
  updateTokenDisplay(type, token) {
    const iconId = `${type}-token-icon`;
    const symbolId = `${type}-token-symbol`;

    const iconElement = this.dom.getElement(iconId);
    const symbolElement = this.dom.getElement(symbolId);

    if (iconElement) {
      iconElement.src = token.icon;
      iconElement.alt = token.symbol;
      iconElement.onerror = () => {
        iconElement.src = `https://via.placeholder.com/32x32/ccc/999?text=${token.symbol}`;
      };
    }

    if (symbolElement) {
      symbolElement.textContent = token.symbol;
    }
  }

  /**
   * Update balance display
   * @param {string} type - 'from' or 'to'
   * @param {number} balance - Balance amount
   */
  updateBalanceDisplay(type, balance) {
    const balanceId = `${type}-balance`;
    this.dom.setText(balanceId, balance.toFixed(2));
  }

  /**
   * Update exchange rate display
   * @param {number} rate - Exchange rate
   * @param {string} fromToken - Source token
   * @param {string} toToken - Target token
   */
  updateExchangeRateDisplay(rate, fromToken, toToken) {
    if (rate) {
      this.dom.setText('exchange-rate', `1 ${fromToken} = ${rate.toFixed(CONFIG.PRECISION)} ${toToken}`);
      this.dom.setDisplay('exchange-info', 'flex');
    } else {
      this.dom.setDisplay('exchange-info', 'none');
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.dom.setText('error-text', message);
    this.dom.setDisplay('error-message', 'flex');
  }

  /**
   * Hide error message
   */
  hideError() {
    this.dom.setDisplay('error-message', 'none');
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Whether to show loading state
   */
  setLoadingState(isLoading) {
    const btnText = this.dom.getElement('btn-text');
    const spinner = this.dom.getElement('loading-spinner');

    if (isLoading) {
      btnText.style.display = 'none';
      this.dom.setDisplay('loading-spinner', 'block');
      this.dom.setDisabled('swap-button', true);
    } else {
      btnText.style.display = 'block';
      this.dom.setDisplay('loading-spinner', 'none');
    }
  }

  /**
   * Show success state
   */
  showSuccessState() {
    const button = this.dom.getElement('swap-button');
    const btnText = this.dom.getElement('btn-text');

    button.classList.add('success');
    btnText.textContent = 'Swap successful!';
    btnText.style.display = 'block';
    this.dom.setDisplay('loading-spinner', 'none');
    this.dom.setDisabled('swap-button', false);

    setTimeout(() => {
      button.classList.remove('success');
      btnText.textContent = 'Enter an amount';
      this.dom.setDisabled('swap-button', true);
    }, CONFIG.SUCCESS_DISPLAY_TIME);
  }

  /**
   * Animate swap direction button
   */
  animateSwapDirection() {
    const button = this.dom.getElement('swap-direction-btn');
    if (button) {
      button.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
      }, CONFIG.ANIMATION_DURATION);
    }
  }
}

// ============================================================================
// MODAL SERVICE
// ============================================================================

/**
 * Handles token selection modal functionality
 * Provides search, filtering, and selection capabilities
 */
class ModalService {
  constructor(domManager, appState, uiService) {
    this.dom = domManager;
    this.appState = appState;
    this.ui = uiService;
    this.currentModalType = null;
  }

  /**
   * Open token selection modal
   * @param {string} type - 'from' or 'to'
   */
  openModal(type) {
    this.currentModalType = type;
    this.dom.setText('modal-title', `Select ${type === 'from' ? 'From' : 'To'} Token`);
    this.dom.getElement('token-modal').dataset.type = type;
    this.dom.setDisplay('token-modal', 'flex');
    this.dom.setValue('token-search', '');
    this.populateTokenList();
    this.dom.getElement('token-search').focus();
    
    // Update ARIA states
    const selector = this.dom.getElement(`${type}-token-selector`);
    if (selector) {
      selector.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Close token selection modal
   */
  closeModal() {
    this.dom.setDisplay('token-modal', 'none');
    this.currentModalType = null;
    
    // Update ARIA states
    const fromSelector = this.dom.getElement('from-token-selector');
    const toSelector = this.dom.getElement('to-token-selector');
    if (fromSelector) {
      fromSelector.setAttribute('aria-expanded', 'false');
    }
    if (toSelector) {
      toSelector.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Populate token list with search functionality
   * @param {string} searchTerm - Search term to filter tokens
   */
  populateTokenList(searchTerm = '') {
    const availableTokens = this.appState.getAvailableTokens();
    const filteredTokens = availableTokens.filter(token => 
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tokenList = this.dom.getElement('token-list');
    if (!tokenList) return;

    tokenList.innerHTML = filteredTokens.map(token => `
      <div class="token-option" data-symbol="${token.symbol}" role="option" tabindex="0">
        <img src="${token.icon}" alt="${token.symbol}" 
             onerror="this.src='https://via.placeholder.com/32x32/ccc/999?text=${token.symbol}'">
        <div class="token-option-info">
          <div class="token-option-symbol">${token.symbol}</div>
          <div class="token-option-name">${token.name}</div>
        </div>
        <div class="token-balance">${this.appState.getUserBalance(token.symbol).toFixed(2)}</div>
      </div>
    `).join('');

    // Add click listeners and keyboard navigation
    tokenList.querySelectorAll('.token-option').forEach(option => {
      option.addEventListener('click', () => this.selectToken(option.dataset.symbol));
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectToken(option.dataset.symbol);
        }
      });
    });
  }

  /**
   * Handle token selection from modal
   * @param {string} symbol - Selected token symbol
   */
  selectToken(symbol) {
    if (this.currentModalType === 'from') {
      this.appState.selectedFromToken = symbol;
    } else {
      this.appState.selectedToToken = symbol;
    }

    this.updateTokenDisplays();
    this.closeModal();
  }

  /**
   * Update all token displays after selection
   */
  updateTokenDisplays() {
    const fromToken = this.appState.getAvailableTokens().find(t => t.symbol === this.appState.selectedFromToken);
    const toToken = this.appState.getAvailableTokens().find(t => t.symbol === this.appState.selectedToToken);

    if (fromToken) {
      this.ui.updateTokenDisplay('from', fromToken);
    }
    if (toToken) {
      this.ui.updateTokenDisplay('to', toToken);
    }

    this.updateBalanceDisplays();
  }

  /**
   * Update balance displays
   */
  updateBalanceDisplays() {
    this.ui.updateBalanceDisplay('from', this.appState.getUserBalance(this.appState.selectedFromToken));
    this.ui.updateBalanceDisplay('to', this.appState.getUserBalance(this.appState.selectedToToken));
  }

  /**
   * Update balances after successful swap
   * @param {string} fromToken - Token being swapped from
   * @param {string} toToken - Token being swapped to
   * @param {number} fromAmount - Amount being swapped
   * @param {number} toAmount - Amount being received
   */
  updateBalancesAfterSwap(fromToken, toToken, fromAmount, toAmount) {
    const currentFromBalance = this.appState.getUserBalance(fromToken);
    const currentToBalance = this.appState.getUserBalance(toToken);
    
    // Create new balances object with updated values
    const newBalances = {};
    this.appState.userBalances.forEach((balance, symbol) => {
      newBalances[symbol] = balance;
    });
    newBalances[fromToken] = currentFromBalance - fromAmount;
    newBalances[toToken] = currentToBalance + toAmount;
    
    this.appState.setUserBalances(newBalances);
    this.updateBalanceDisplays();
  }
}

// ============================================================================
// MAIN APPLICATION CLASS
// ============================================================================

/**
 * Main application orchestrator
 * Coordinates all services and manages application lifecycle
 */
class TokenSwapApp {
  constructor() {
    this.appState = new AppState();
    this.domManager = new DOMElementManager();
    this.uiService = new UIService(this.domManager);
    this.modalService = new ModalService(this.domManager, this.appState, this.uiService);
    
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   * Loads data, sets up event listeners, and prepares the UI
   */
  async initialize() {
    try {
      console.log('Initializing Token Swap Application...');
      
      await this.loadInitialData();
      this.setupEventListeners();
      this.initializeUI();
      
      this.isInitialized = true;
      console.log('Application initialized successfully');
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.uiService.showError('Failed to initialize the application. Please refresh the page.');
      throw new Error('Application initialization failed');
    }
  }

  /**
   * Load initial application data
   */
  async loadInitialData() {
    // Load token prices
    const prices = await ApiService.fetchTokenPrices();
    this.appState.setTokenPrices(prices);

    // Load available tokens
    const tokenData = this.getAvailableTokenData();
    this.appState.setAvailableTokens(tokenData);

    // Set mock user balances
    const balances = this.generateMockBalances();
    this.appState.setUserBalances(balances);
  }

  /**
   * Get available token data with icons
   * @returns {TokenData[]} Array of token data
   */
  getAvailableTokenData() {
    return [
      { symbol: 'SWTH', name: 'Switcheo Token', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/SWTH.svg` },
      { symbol: 'ETH', name: 'Ethereum', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/ETH.svg` },
      { symbol: 'BTC', name: 'Bitcoin', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/BTC.svg` },
      { symbol: 'USDC', name: 'USD Coin', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/USDC.svg` },
      { symbol: 'USDT', name: 'Tether', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/USDT.svg` },
      { symbol: 'DAI', name: 'Dai', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/DAI.svg` },
      { symbol: 'UNI', name: 'Uniswap', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/UNI.svg` },
      { symbol: 'LINK', name: 'Chainlink', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/LINK.svg` },
      { symbol: 'AAVE', name: 'Aave', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/AAVE.svg` },
      { symbol: 'COMP', name: 'Compound', icon: `${CONFIG.API_ENDPOINTS.ICON_BASE_URL}/COMP.svg` }
    ];
  }

  /**
   * Generate mock user balances for demonstration
   * @returns {Object} Map of token symbols to balances
   */
  generateMockBalances() {
    const balances = {};
    this.appState.getAvailableTokens().forEach(token => {
      balances[token.symbol] = Math.random() * (CONFIG.MAX_BALANCE - CONFIG.MIN_BALANCE) + CONFIG.MIN_BALANCE;
    });
    return balances;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Form submission
    const form = this.domManager.getElement('swap-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSwapSubmit(e));
    }

    // Amount input changes
    const fromAmount = this.domManager.getElement('from-amount');
    const toAmount = this.domManager.getElement('to-amount');
    
    if (fromAmount) {
      fromAmount.addEventListener('input', () => this.handleFromAmountChange());
    }
    if (toAmount) {
      toAmount.addEventListener('input', () => this.handleToAmountChange());
    }

    // Token selectors
    const fromSelector = this.domManager.getElement('from-token-selector');
    const toSelector = this.domManager.getElement('to-token-selector');
    
    if (fromSelector) {
      fromSelector.addEventListener('click', () => this.modalService.openModal('from'));
    }
    if (toSelector) {
      toSelector.addEventListener('click', () => this.modalService.openModal('to'));
    }

    // Swap direction button
    const swapDirectionBtn = this.domManager.getElement('swap-direction-btn');
    if (swapDirectionBtn) {
      swapDirectionBtn.addEventListener('click', () => this.swapTokens());
    }

    // Modal events
    const modalClose = this.domManager.getElement('modal-close');
    const tokenSearch = this.domManager.getElement('token-search');
    const tokenModal = this.domManager.getElement('token-modal');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => this.modalService.closeModal());
    }
    if (tokenSearch) {
      tokenSearch.addEventListener('input', (e) => this.modalService.populateTokenList(e.target.value));
    }
    if (tokenModal) {
      tokenModal.addEventListener('click', (e) => {
        if (e.target === tokenModal) {
          this.modalService.closeModal();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.modalService.closeModal();
      }
    });
  }

  /**
   * Handle from amount input changes
   */
  handleFromAmountChange() {
    const amount = parseFloat(this.domManager.getElement('from-amount')?.value) || 0;
    this.calculateToAmount(amount);
    this.validateAndUpdateUI();
  }

  /**
   * Handle to amount input changes
   */
  handleToAmountChange() {
    const amount = parseFloat(this.domManager.getElement('to-amount')?.value) || 0;
    this.calculateFromAmount(amount);
    this.validateAndUpdateUI();
  }

  /**
   * Calculate amount to receive based on from amount
   * @param {number} fromAmount - Amount to swap
   */
  calculateToAmount(fromAmount) {
    if (!fromAmount) {
      this.domManager.setValue('to-amount', '');
      return;
    }

    const toAmount = this.appState.calculateToAmount(
      fromAmount,
      this.appState.selectedFromToken,
      this.appState.selectedToToken
    );

    if (toAmount !== null) {
      this.domManager.setValue('to-amount', toAmount.toFixed(CONFIG.PRECISION));
    } else {
      this.domManager.setValue('to-amount', '');
    }
  }

  /**
   * Calculate amount to send based on to amount
   * @param {number} toAmount - Desired receive amount
   */
  calculateFromAmount(toAmount) {
    if (!toAmount) {
      this.domManager.setValue('from-amount', '');
      return;
    }

    const fromAmount = this.appState.calculateFromAmount(
      toAmount,
      this.appState.selectedFromToken,
      this.appState.selectedToToken
    );

    if (fromAmount !== null) {
      this.domManager.setValue('from-amount', fromAmount.toFixed(CONFIG.PRECISION));
    } else {
      this.domManager.setValue('from-amount', '');
    }
  }

  /**
   * Swap token positions
   */
  swapTokens() {
    const tempToken = this.appState.selectedFromToken;
    const tempAmount = this.domManager.getElement('from-amount')?.value || '';

    this.appState.setSelectedTokens(this.appState.selectedToToken, tempToken);

    this.modalService.updateTokenDisplays();

    this.domManager.setValue('from-amount', this.domManager.getElement('to-amount')?.value || '');
    this.domManager.setValue('to-amount', tempAmount);

    this.validateAndUpdateUI();
    this.uiService.animateSwapDirection();
  }

  /**
   * Validate inputs and update UI accordingly
   */
  validateAndUpdateUI() {
    const fromAmount = parseFloat(this.domManager.getElement('from-amount')?.value) || 0;
    const toAmount = parseFloat(this.domManager.getElement('to-amount')?.value) || 0;

    const swapState = {
      fromAmount,
      toAmount
    };

    const validation = ValidationService.validateSwap(swapState, this.appState);
    
    // Debug logging
    console.log('Validation state:', {
      fromAmount,
      toAmount,
      fromToken: this.appState.selectedFromToken,
      toToken: this.appState.selectedToToken,
      isValid: validation.isValid,
      message: validation.message
    });
    
    // Update button text and state
    this.domManager.setText('btn-text', validation.message);
    this.domManager.setDisabled('swap-button', !validation.isValid);

    // Update error display
    if (validation.isValid) {
      this.uiService.hideError();
    } else if (fromAmount > 0 || toAmount > 0) {
      // Only show error if user has entered some amount
      this.uiService.showError(validation.message);
    } else {
      // Hide error if no amounts entered (initial state)
      this.uiService.hideError();
    }

    this.updateExchangeInfo();
  }

  /**
   * Update exchange rate information
   */
  updateExchangeInfo() {
    const fromAmount = parseFloat(this.domManager.getElement('from-amount')?.value) || 0;
    
    if (fromAmount > 0) {
      const rate = this.appState.calculateExchangeRate(
        this.appState.selectedFromToken,
        this.appState.selectedToToken
      );
      
      this.uiService.updateExchangeRateDisplay(
        rate,
        this.appState.selectedFromToken,
        this.appState.selectedToToken
      );
    } else {
      this.domManager.setDisplay('exchange-info', 'none');
    }
  }

  /**
   * Update all UI elements
   */
  updateUI() {
    this.modalService.updateTokenDisplays();
    this.validateAndUpdateUI();
  }

  /**
   * Initialize UI with default state
   */
  initializeUI() {
    // Set initial token displays
    const fromToken = this.appState.getAvailableTokens().find(t => t.symbol === this.appState.selectedFromToken);
    const toToken = this.appState.getAvailableTokens().find(t => t.symbol === this.appState.selectedToToken);

    if (fromToken) {
      this.uiService.updateTokenDisplay('from', fromToken);
    }
    if (toToken) {
      this.uiService.updateTokenDisplay('to', toToken);
    }

    // Update balance displays
    this.modalService.updateBalanceDisplays();

    // Set initial button state
    this.domManager.setText('btn-text', 'Enter an amount');
    this.domManager.setDisabled('swap-button', true);
    this.uiService.hideError();

    // Initialize validation state
    this.validateAndUpdateUI();
  }

  /**
   * Handle swap form submission
   * @param {Event} e - Form submission event
   */
  async handleSwapSubmit(e) {
    e.preventDefault();

    const fromAmount = parseFloat(this.domManager.getElement('from-amount')?.value) || 0;
    const toAmount = parseFloat(this.domManager.getElement('to-amount')?.value) || 0;

    const swapState = { fromAmount, toAmount };
    const validation = ValidationService.validateSwap(swapState, this.appState);

    if (!validation.isValid) {
      this.uiService.showError(validation.message);
      return;
    }

    // Show loading state
    this.uiService.setLoadingState(true);
    this.uiService.hideError();

    try {
      const success = await ApiService.simulateSwap(swapState);
      
      if (success) {
        // Update balances
        this.modalService.updateBalancesAfterSwap(
          this.appState.selectedFromToken,
          this.appState.selectedToToken,
          fromAmount,
          toAmount
        );

        // Clear inputs
        this.domManager.setValue('from-amount', '');
        this.domManager.setValue('to-amount', '');

        // Update UI
        this.updateUI();
        this.uiService.showSuccessState();

      } else {
        throw new Error('Swap simulation failed');
      }

    } catch (error) {
      console.error('Swap error:', error);
      this.uiService.showError('Swap failed. Please try again.');
    } finally {
      this.uiService.setLoadingState(false);
    }
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Global application instance
 */
let app;

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    app = new TokenSwapApp();
    await app.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});
