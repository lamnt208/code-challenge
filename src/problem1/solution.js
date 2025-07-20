/**
 * Problem 1: Sum to n - Multiple Implementation Approaches
 * 
 * This module demonstrates various approaches to calculate the sum of integers from 1 to n.
 * Each implementation showcases different programming paradigms and performance characteristics.
 * 
 * Time Complexity Analysis:
 * - Iterative approaches: O(n)
 * - Mathematical formula: O(1)
 * - Recursive approach: O(n) with O(n) space complexity
 * - Functional approaches: O(n)
 * 
 * @author Lam Nguyen
 * @version 1.0.0
 */

/**
 * Calculates the sum of integers from 1 to n using iterative approach.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNIterative = (n) => {
    validateInput(n);
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Calculates the sum using the arithmetic series formula.
 * This is the most efficient approach with O(1) time complexity.
 * 
 * Formula: sum = n * (n + 1) / 2
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNMathematical = (n) => {
    validateInput(n);
    return (n * (n + 1)) / 2;
};

/**
 * Calculates the sum using recursive approach.
 * Note: This approach has O(n) space complexity due to call stack.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNRecursive = (n) => {
    validateInput(n);
    
    if (n === 1) return 1;
    return n + sumToNRecursive(n - 1);
};

/**
 * Calculates the sum using functional programming approach with Array methods.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNFunctional = (n) => {
    validateInput(n);
    return Array.from({ length: n }, (_, index) => index + 1)
                .reduce((sum, num) => sum + num, 0);
};

/**
 * Calculates the sum using while loop approach.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNWhile = (n) => {
    validateInput(n);
    
    let sum = 0;
    let i = 1;
    
    while (i <= n) {
        sum += i;
        i++;
    }
    return sum;
};

/**
 * Calculates the sum using generator function approach.
 * Demonstrates modern JavaScript features and memory efficiency.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNGenerator = (n) => {
    validateInput(n);
    
    function* range(start, end) {
        for (let i = start; i <= end; i++) {
            yield i;
        }
    }
    
    let sum = 0;
    for (const num of range(1, n)) {
        sum += num;
    }
    return sum;
};

/**
 * Calculates the sum using bit manipulation for division by 2.
 * Demonstrates low-level optimization techniques.
 * 
 * @param {number} n - The upper bound (inclusive)
 * @returns {number} The sum of integers from 1 to n
 * @throws {Error} If n is not a positive integer
 */
const sumToNBitManipulation = (n) => {
    validateInput(n);
    return (n * (n + 1)) >> 1; // Right shift by 1 is equivalent to division by 2
};

/**
 * Validates input parameters for all sum functions.
 * 
 * @param {number} n - The value to validate
 * @throws {Error} If n is not a positive integer
 */
const validateInput = (n) => {
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error('Input must be a positive integer');
    }
};

/**
 * Performance benchmark utility to compare different implementations.
 * 
 * @param {Function} fn - The function to benchmark
 * @param {number} n - The input value
 * @param {number} iterations - Number of iterations for averaging
 * @returns {Object} Performance metrics
 */
const benchmark = (fn, n, iterations = 1000) => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        fn(n);
    }
    
    const end = performance.now();
    return {
        averageTime: (end - start) / iterations,
        totalTime: end - start,
        iterations
    };
};

/**
 * Comprehensive test suite for all implementations.
 */
const runTestSuite = () => {
    const testCases = [1, 5, 10, 100, 1000];
    const implementations = [
        { name: 'Iterative', fn: sumToNIterative },
        { name: 'Mathematical', fn: sumToNMathematical },
        { name: 'Recursive', fn: sumToNRecursive },
        { name: 'Functional', fn: sumToNFunctional },
        { name: 'While Loop', fn: sumToNWhile },
        { name: 'Generator', fn: sumToNGenerator },
        { name: 'Bit Manipulation', fn: sumToNBitManipulation }
    ];

    console.log('🧪 Running Comprehensive Test Suite\n');

    // Test all implementations
    for (const testCase of testCases) {
        console.log(`📊 Testing with n = ${testCase}:`);
        
        const expected = (testCase * (testCase + 1)) / 2;
        
        for (const impl of implementations) {
            try {
                const result = impl.fn(testCase);
                const status = result === expected ? '✅' : '❌';
                console.log(`  ${status} ${impl.name}: ${result}`);
            } catch (error) {
                console.log(`  ❌ ${impl.name}: Error - ${error.message}`);
            }
        }
        console.log('');
    }

    // Performance benchmark
    console.log('⚡ Performance Benchmark (n=10000, 1000 iterations):');
    for (const impl of implementations) {
        try {
            const metrics = benchmark(impl.fn, 10000, 1000);
            console.log(`  ${impl.name}: ${metrics.averageTime.toFixed(4)}ms average`);
        } catch (error) {
            console.log(`  ${impl.name}: Error - ${error.message}`);
        }
    }
};

// Export functions for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sumToNIterative,
        sumToNMathematical,
        sumToNRecursive,
        sumToNFunctional,
        sumToNWhile,
        sumToNGenerator,
        sumToNBitManipulation,
        validateInput,
        benchmark,
        runTestSuite
    };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runTestSuite();
}