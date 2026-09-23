# Roadmap

Our implementation roadmap is broken down into small, actionable phases focusing first on core infrastructure and e-commerce integration.

## Phase 1: Core MVP & E-Commerce Extension
- **1.1 Smart Contract Foundation:** Develop and deploy the core Soroban (Rust) smart contracts for the non-custodial vault to handle deposits and tokenized savings.
- **1.2 Basic Web App & Wallet:** Build the Next.js/TypeScript frontend and integrate the Freighter Wallet for user authentication and transaction signing.
- **1.3 Browser Extension Prototype:** Develop a browser extension capable of reading cart data on target e-commerce sites.
- **1.4 Substitution Engine:** Implement the logic to suggest substitute products and calculate the price difference.
- **1.5 E2E Flow Integration:** Connect the extension to the web app and smart contract, enabling the complete flow: product substitution -> difference calculation -> automated deposit into Soroban.

## Phase 2: Yield Generation & Local Commerce (Future)
- **2.1 DeFi Integration:** Connect the Soroban vault to Stellar liquidity protocols to generate yield (APY) on the micro-savings.
- **2.2 Local Store Mapping:** Introduce an interactive map for physical stores (SMEs).
- **2.3 QR/Voucher System:** Implement the Click & Collect or QR code validation for in-person product substitutions.
