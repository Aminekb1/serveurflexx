// frontend_react/app/__tests__/layouts/MainLayout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  // keep other exports (NavLink, MemoryRouter) from actual module
  return { ...actual, useNavigate: () => mockNavigate };
});

// component under test
import MainLayout from '../../src/layouts/MainLayout';

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows Log in and Sign Up when no user; buttons navigate', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout });

    render(
      <MemoryRouter>
        <MainLayout>
          <div>Child content</div>
        </MainLayout>
      </MemoryRouter>
    );

    // Search box present
    expect(screen.getByPlaceholderText(/Search your domain/i)).toBeInTheDocument();

    // Login and Sign Up present
    const loginBtn = screen.getByRole('button', { name: /Log in/i });
    const signUpBtn = screen.getByRole('button', { name: /Sign Up/i });
    expect(loginBtn).toBeInTheDocument();
    expect(signUpBtn).toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login');

    fireEvent.click(signUpBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/auth/register');
  });

  test('shows Dashboard and Logout when user present; logout called on click', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ user: { _id: 'u1' }, logout: mockLogout });

    render(
      <MemoryRouter>
        <MainLayout>
          <div>Child content</div>
        </MainLayout>
      </MemoryRouter>
    );

    // Dashboard link should exist (NavLink renders anchor)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    // Logout button present and triggers logout function
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
