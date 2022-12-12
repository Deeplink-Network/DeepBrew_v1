import { BigNumber } from 'ethers';

export const chainId = Number(process.env.REACT_APP_CHAIN_ID) || 97;
export const E18 = BigNumber.from(10).pow(18);
export const E9 = BigNumber.from(10).pow(9);
