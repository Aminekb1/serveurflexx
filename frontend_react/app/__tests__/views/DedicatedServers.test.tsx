// frontend_react/app/__tests__/views/DedicatedServers.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock MainLayout
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => <div data-testid="layout">{children}</div>);

// mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// component under test
import DedicatedServers from '../../src/views/DedicatedServers';

describe('DedicatedServers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ loading: false });
  });

  test('renders hero and benefits', () => {
    render(<DedicatedServers />);
    expect(screen.getByText(/Dedicated Servers for Maximum Power/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Our Dedicated Servers\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Configurations/i)).toBeInTheDocument();
  });

  test('Configure Your Server button navigates to configure page', () => {
    render(<DedicatedServers />);
    fireEvent.click(screen.getByText(/Configure Your Server/i));
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server?type=dedicated');
  });

  test('shows loading when context loading is true', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    render(<DedicatedServers />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
