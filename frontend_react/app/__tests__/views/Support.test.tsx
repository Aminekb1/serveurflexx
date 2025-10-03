// frontend_react/app/__tests__/views/Support.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MainLayout to render children (keeps snapshot small)
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => (
  <div data-testid="layout">{children}</div>
));

// Mock useAuth from context to control loading state
const mockUseAuth = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Component under test (note the corrected relative path ../../src)
import Support from '../../src/views/Support';

describe('Support view', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ loading: false });
  });

  test('renders hero, support cards and contact form', () => {
    render(<Support />);

    // hero & sections
    expect(screen.getByText(/We're Here to Help/i)).toBeInTheDocument();
    expect(screen.getByText(/Support Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();

    // links/buttons (use role="link" to avoid ambiguous matches)
    expect(screen.getByRole('link', { name: /Explore Now/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Submit a Ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact Us/i })).toBeInTheDocument();

    // form fields (labels use aria-labels in component)
    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Submit contact form/i)).toBeInTheDocument();
  });

  test('shows loading when context loading is true', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    render(<Support />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('submitting the form logs the expected payload', () => {
    mockUseAuth.mockReturnValue({ loading: false });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<Support />);

    fireEvent.change(screen.getByLabelText(/Your name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Your email address/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Your message/i), { target: { value: 'Help me' } });

    // Click the submit button (it will trigger the form submit handler)
    fireEvent.click(screen.getByLabelText(/Submit contact form/i));

    expect(consoleSpy).toHaveBeenCalledWith('Support form submitted:', {
      name: 'Alice',
      email: 'a@b.com',
      message: 'Help me',
    });

    consoleSpy.mockRestore();
  });
});
