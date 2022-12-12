import { Config, ConnectorNames } from './types';

const connectors: Config[] = [
  {
    title: 'Metamask',
    connectorId: ConnectorNames.Injected,
  },
  {
    title: 'Binance Wallet',
    connectorId: ConnectorNames.BSC,
  },
  {
    title: 'Coinbase',
    connectorId: ConnectorNames.WalletLink,
  },
  {
    title: 'Wallet Connect',
    connectorId: ConnectorNames.WalletConnect,
  },
  {
    title: 'Math Wallet',
    connectorId: ConnectorNames.Injected,
  },
  {
    title: 'Token Pocket',
    connectorId: ConnectorNames.Injected,
  },
  {
    title: 'SafePal Wallet',
    connectorId: ConnectorNames.Injected,
  },
];

export default connectors;
export const connectorLocalStorageKey = 'connectorId';
