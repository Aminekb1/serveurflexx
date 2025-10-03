// frontend_react/app/__tests__/views/VPSHosting.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock MainLayout to just render children
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => <div data-testid="layout">{children}</div>);

// mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// mock react-router-dom useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Component under test (corrected path ../../src)
import VPSHosting from '../../src/views/VPSHosting';

describe('VPSHosting view', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ loading: false });
    mockNavigate.mockReset();
  });

  test('renders hero and benefits', () => {
    render(<VPSHosting />);

    expect(screen.getByText(/Scalable VPS Hosting for Your Needs/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Choose Our VPS Hosting\?/i)).toBeInTheDocument();
    expect(screen.getByText(/High Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Control/i)).toBeInTheDocument();
  });

  test('shows loading when loading true', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    render(<VPSHosting />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('Configure Your VPS button navigates to configure page', () => {
    mockUseAuth.mockReturnValue({ loading: false });
    render(<VPSHosting />);

    const btn = screen.getByText(/Configure Your VPS/i);
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server?type=vps');
  });
});
