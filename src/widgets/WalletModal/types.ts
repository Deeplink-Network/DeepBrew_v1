export enum ConnectorNames {
  Injected = 'injected',
  WalletConnect = 'walletconnect',
  BSC = 'bsc',
  WalletLink = 'walletlink',
}

export type Login = (connectorId: ConnectorNames) => void;

export interface Config {
  title: string;
  connectorId: ConnectorNames;
  bgColor?: string;
}
