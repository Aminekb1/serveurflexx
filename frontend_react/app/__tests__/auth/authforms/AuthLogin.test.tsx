// frontend_react/app/__tests__/auth/authforms/AuthLogin.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// IMPORTANT : tests sont exécutés depuis app/__tests__, le code source est dans app/src
import AuthLogin from '../../../src/views/auth/authforms/AuthLogin';

jest.mock('axios', () => ({ post: jest.fn() }));
import axios from 'axios';

// jwt-decode est importé dans le composant comme { jwtDecode }
jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));
import { jwtDecode } from 'jwt-decode';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// mock AuthContext (depuis le dossier src)
jest.mock('../../../src/context/AuthContext', () => ({ useAuth: jest.fn() }));
import { useAuth } from '../../../src/context/AuthContext';

describe('AuthLogin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    // default : provide a mocked login function so component can call it
    (useAuth as jest.Mock).mockReturnValue({ login: jest.fn() });
  });

  test('successful login stores token and navigates', async () => {
    // arrange
    (axios.post as jest.Mock).mockResolvedValue({ data: { access_token: 'tok123' } });
    (jwtDecode as jest.Mock).mockReturnValue({ _id: 'u123' });

    render(
      <MemoryRouter>
        <AuthLogin />
      </MemoryRouter>
    );

    // fill form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    // assert
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(localStorage.getItem('token')).toBe('tok123'));
    expect(localStorage.getItem('userId')).toBe('u123');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  test('failed login shows error message', async () => {
    const err = { response: { status: 401 } };
    (axios.post as jest.Mock).mockRejectedValue(err);

    render(
      <MemoryRouter>
        <AuthLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(await screen.findByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
  });
});
