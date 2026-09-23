# Tech Stack

Standup Finance is built on a modern, decentralized tech stack designed for speed, low cost, and a seamless user experience.

## Core Infrastructure
- **Blockchain:** Stellar Network (low-cost, high-speed transactions).
- **Smart Contracts:** Soroban (Rust) for non-custodial logic, recording, and allocating tokenized micro-savings.

## Frontend & User Connectivity
- **Framework:** Next.js with TypeScript for a reactive, robust web application.
- **Wallet Integration:** Freighter Wallet for secure on-chain transaction signing.

## Browser Extension (E-Commerce Integration)
- **Architecture:** A lightweight browser extension that acts as a top-layer optimization tool over major e-commerce platforms.
- **Functionality:** 
  - Detects when a user adds a premium product to their cart.
  - Suggests equivalent substitute products (e.g., local SME brands) of equal quality.
  - Calculates the exact price differential.
  - Automatically routes the saved amount (the price difference) into the Soroban smart contract when the user accepts the substitution.
