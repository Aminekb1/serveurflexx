// frontend_react/app/__tests__/views/auth/Register.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../src/layouts/full/shared/logo/FullLogo', () => () => <div data-testid="logo">LogoMock</div>);
jest.mock('../../../src/views/auth/authforms/AuthRegister', () => () => <div data-testid="auth-register">AuthRegisterMock</div>);
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return { ...actual, Link: ({ to, children }: any) => <a href={to}>{children}</a> };
});

import Register from '../../../src/views/auth/register/Register';

describe('Register page', () => {
  test('renders logo, AuthRegister and link to login', () => {
    render(<Register />);

    expect(screen.getByTestId('logo')).toHaveTextContent('LogoMock');
    expect(screen.getByTestId('auth-register')).toHaveTextContent('AuthRegisterMock');

    expect(screen.getByText(/Sign Up on Cloud graph/i)).toBeInTheDocument();

    const loginLink = screen.getByText(/Sign in/i).closest('a');
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });
});
