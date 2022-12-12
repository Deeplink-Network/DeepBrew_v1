import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { light } from 'theme';

const Providers = ({ children }) => {
  return <SCThemeProvider theme={light}>{children}</SCThemeProvider>;
};

export default Providers;
