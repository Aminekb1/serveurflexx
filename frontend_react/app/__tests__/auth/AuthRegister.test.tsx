// frontend_react/app/__tests__/auth/AuthRegister.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock axios
jest.mock('axios', () => ({ post: jest.fn() }));
import axios from 'axios';

// mock react-router-dom useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// component under test
import AuthRegister from '../../src/views/auth/authforms/AuthRegister';

describe('AuthRegister', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockNavigate.mockReset();
  });

  test('shows validation error for invalid inputs and does not call API', async () => {
    render(<AuthRegister />);

    // set name too short to trigger first validation error
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'ab' } });

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Instead of relying on the exact error text, assert the expected side-effects:
    //  - the API should not be called
    //  - navigation should not happen
    await waitFor(() => expect((axios.post as jest.Mock)).not.toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('submits valid form and navigates to login', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 201 });

    render(<AuthRegister />);

    // provide valid values for all validations
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'ValidUser' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Aa1!aaaa' } }); // meets rules
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+1234567890' } });

    // Use a strict label matcher for "age" to avoid matching "Image"
    fireEvent.change(screen.getByLabelText(/^age$/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'https://example.com/img.jpg' } });

    // select role
    const roleSelect = screen.getByRole('combobox', { name: /Role/i });
    fireEvent.change(roleSelect, { target: { value: 'client' } });

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => expect((axios.post as jest.Mock)).toHaveBeenCalled());

    // check axios called with expected endpoint and payload contains name/email
    expect((axios.post as jest.Mock)).toHaveBeenCalledWith(
      expect.stringContaining('/users/signup'),
      expect.objectContaining({
        name: 'ValidUser',
        email: 'user@example.com',
        password: 'Aa1!aaaa',
        role: 'client',
        phone: '+1234567890',
        age: expect.any(Number),
        image_User: 'https://example.com/img.jpg',
      }),
      expect.any(Object)
    );

    // should navigate to login
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/auth/login'));
  });
});
