import React from 'react';
import './App.css';
import WalletPage from './WalletPage';

// Mock data to demonstrate the WalletPage component
const mockBalances = [
  { currency: 'ETH', amount: 2.5, blockchain: 'Ethereum' },
  { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
  { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
  { currency: 'ZIL', amount: 1000, blockchain: 'Zilliqa' },
  { currency: 'NEO', amount: 25, blockchain: 'Neo' },
  { currency: 'BTC', amount: 0.1, blockchain: 'Bitcoin' }, // Should be filtered out (unknown blockchain)
  { currency: 'ETH', amount: -1, blockchain: 'Ethereum' }, // Should be filtered out (negative amount)
];

const mockPrices = {
  'ETH': 2000,
  'OSMO': 2.5,
  'ARB': 1.2,
  'ZIL': 0.02,
  'NEO': 15,
  'BTC': 40000,
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Wallet Page Demo</h1>
        <p>Showing refactored WalletPage component with sample data</p>
      </header>
      <main style={{ padding: '20px' }}>
        <h2>Wallet Balances (Sorted by Priority)</h2>
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <p><strong>Expected behavior:</strong></p>
          <ul>
            <li>Balances should be sorted by blockchain priority (Osmosis → Ethereum → Arbitrum → Zilliqa/Neo)</li>
            <li>Negative amounts and unknown blockchains should be filtered out</li>
            <li>Each row should show amount, USD value, and formatted amount</li>
          </ul>
          <WalletPage 
            className="wallet-container" 
            mockBalances={mockBalances}
            mockPrices={mockPrices}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
