import { createGlobalStyle } from 'styled-components';
import darkTheme from '../config/theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,700,500,600&display=swap');

  body, input, button, select, textarea {
    font-family: 'Clash Grotesk', 'Comic Sans MS', cursive !important;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Clash Grotesk', sans-serif !important;
    font-weight: 700;
  }

  body {
    background-color: ${darkTheme.colors.background};
    color: ${darkTheme.text.primary};
    font-family: 'Roboto', sans-serif;
  }

  .container {
    padding: 2rem 1rem;
  }

  .card {
    background-color: ${darkTheme.colors.surface};
    border: 1px solid ${darkTheme.colors.primary}40;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .card-title {
    color: ${darkTheme.colors.primary};
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .form-control, .form-select {
    background-color: ${darkTheme.colors.surface};
    border-color: ${darkTheme.colors.primary}40;
    color: ${darkTheme.text.primary};
    font-size: 0.9rem;
  }

  .btn {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
  }

  .btn-primary {
    background-color: ${darkTheme.colors.primary};
    border-color: ${darkTheme.colors.primary};
    color: ${darkTheme.colors.onPrimary};
  }

  .btn-outline-primary {
    background-color: transparent;
    border-color: ${darkTheme.colors.primary};
    color: ${darkTheme.colors.primary};
  }

  .badge {
    font-size: 0.8rem;
    padding: 0.3em 0.6em;
  }
`;

export default GlobalStyles;
