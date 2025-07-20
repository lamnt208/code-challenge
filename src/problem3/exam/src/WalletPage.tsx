import React, { useMemo } from 'react';

// Type definitions for hooks and components
interface WalletBalancesHook {
  (): WalletBalance[];
}

interface PricesHook {
  (): Record<string, number>;
}

interface WalletRowProps {
  className?: string;
  key?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

// Mock implementations - these would be replaced with actual imports
const useWalletBalances: WalletBalancesHook = () => [];
const usePrices: PricesHook = () => ({});
const WalletRow: React.FC<WalletRowProps> = ({ amount, usdValue, formattedAmount, className }) => (
  <div className={className} style={{ 
    padding: '10px', 
    border: '1px solid #ddd', 
    margin: '5px 0',
    borderRadius: '4px',
    backgroundColor: 'white'
  }}>
    <strong>Amount:</strong> {amount} | 
    <strong> USD Value:</strong> ${usdValue.toFixed(2)} | 
    <strong> Formatted:</strong> {formattedAmount}
  </div>
);
const classes = { row: 'wallet-row' };

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  blockchain: string;
}

interface Props {
  children?: React.ReactNode;
  className?: string;
  mockBalances?: WalletBalance[];
  mockPrices?: Record<string, number>;
  [key: string]: any;
}

// Constants for better maintainability
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  'Osmosis': 100,
  'Ethereum': 50,
  'Arbitrum': 30,
  'Zilliqa': 20,
  'Neo': 20,
} as const;

const DEFAULT_PRIORITY = -99;

const WalletPage: React.FC<Props> = ({ 
  children, 
  className, 
  mockBalances, 
  mockPrices, 
  ...rest 
}) => {
  // Always call hooks in the same order
  const hookBalances = useWalletBalances();
  const hookPrices = usePrices();
  
  // Use mock data if provided, otherwise use hook data
  const balances = mockBalances || hookBalances;
  const prices = mockPrices || hookPrices;

  const getPriority = (blockchain: string): number => {
    return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Only include balances with positive amounts and valid priorities
        return balancePriority > DEFAULT_PRIORITY && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // Handle equal priorities
      });
  }, [balances]); // Removed prices from dependencies since it's not used in calculation

  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      const formattedAmount = balance.amount.toFixed();
      
      return (
        <WalletRow 
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`} // Better key than index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      );
    });
  }, [sortedBalances, prices, classes.row]);

  return (
    <div className={className} {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage; 