const darkTheme = {
  colors: {
    background: '#000000',
    surface: '#121212',
    primary: '#FFFFFF',
    primaryVariant: '#E0E0E0',
    secondary: '#03dac6',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    onSecondary: '#000000',
    error: '#cf6679',
    success: '#00c853',
    warning: '#ffab00',
    info: '#2196f3',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6c6c6c',
    hint: '#8c8c8c',
  }
};

export default darkTheme;

export const getThemeStyles = (theme) => `
  body {
    background-color: ${theme.colors.background};
    color: ${theme.text.primary};
  }

  .card {
    background-color: ${theme.colors.surface};
    border: none;
  }

  .form-control, .form-select {
    background-color: ${theme.colors.surface};
    border-color: ${theme.colors.onSurface}40;
    color: ${theme.text.primary};
  }

  .form-control:focus, .form-select:focus {
    background-color: ${theme.colors.surface};
    border-color: ${theme.colors.primary};
    color: ${theme.text.primary};
    box-shadow: 0 0 0 0.25rem ${theme.colors.primary}40;
  }

  .btn-primary {
    background-color: ${theme.colors.primary};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.onPrimary};
  }

  .btn-primary:hover, .btn-primary:focus {
    background-color: ${theme.colors.primaryVariant};
    border-color: ${theme.colors.primaryVariant};
    color: ${theme.colors.onPrimary};
  }

  .btn-outline-secondary {
    color: ${theme.colors.secondary};
    border-color: ${theme.colors.secondary};
  }

  .btn-outline-secondary:hover, .btn-outline-secondary:focus {
    background-color: ${theme.colors.secondary};
    border-color: ${theme.colors.secondary};
    color: ${theme.colors.onSecondary};
  }

  .navbar {
    background-color: ${theme.colors.surface} !important;
  }

  .navbar-brand, .nav-link {
    color: ${theme.text.primary} !important;
  }

  .text-muted {
    color: ${theme.text.secondary} !important;
  }

  .text-secondary {
    color: ${theme.colors.secondary} !important;
  }

  a {
    color: ${theme.colors.primary};
  }

  a:hover {
    color: ${theme.colors.primaryVariant};
  }

  .form-label {
    color: ${theme.text.primary};
  }

  .modal-content {
    background-color: ${theme.colors.surface};
    color: ${theme.text.primary};
  }

  .modal-header {
    border-bottom-color: ${theme.colors.onSurface}40;
  }

  .modal-footer {
    border-top-color: ${theme.colors.onSurface}40;
  }

  .close {
    color: ${theme.text.primary};
  }

  .alert-info {
    background-color: ${theme.colors.surface};
    color: ${theme.colors.info};
    border-color: ${theme.colors.info}40;
  }

  .badge {
    color: ${theme.colors.onPrimary};
  }

  .badge-primary {
    background-color: ${theme.colors.primary};
  }

  .badge-secondary {
    background-color: ${theme.colors.secondary};
  }

  .badge-success {
    background-color: ${theme.colors.success};
  }

  .badge-danger {
    background-color: ${theme.colors.error};
  }

  .badge-warning {
    background-color: ${theme.colors.warning};
  }

  .badge-info {
    background-color: ${theme.colors.info};
  }

  ::placeholder {
    color: ${theme.text.hint} !important;
  }
`;
