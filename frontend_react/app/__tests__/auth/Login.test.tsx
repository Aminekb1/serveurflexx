// frontend_react/app/__tests__/auth/Login.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock the internals to keep test focused and fast
jest.mock('../../src/layouts/full/shared/logo/FullLogo', () => () => <div data-testid="full-logo">FullLogoMock</div>);
jest.mock('../../src/views/auth/authforms/AuthLogin', () => () => <div data-testid="auth-login">AuthLoginMock</div>);

// react-router Link is used in the component
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return { ...actual, Link: ({ children, to, ...rest }: any) => <a href={to} {...rest}>{children}</a> };
});

// NOTE: correct relative path from __tests__/auth to app/src is ../../src
import Login from '../../src/views/auth/login/Login';

describe('Login page', () => {
  test('renders logo, auth form and register link', () => {
    render(<Login />);

    expect(screen.getByTestId('full-logo')).toHaveTextContent('FullLogoMock');
    expect(screen.getByTestId('auth-login')).toHaveTextContent('AuthLoginMock');

    // Link to register
    const createAccount = screen.getByText(/Create an account/i);
    expect(createAccount).toBeInTheDocument();

    const anchor = createAccount.closest('a');
    expect(anchor).toBeTruthy();
    expect(anchor).toHaveAttribute('href', '/auth/register');
  });
});
