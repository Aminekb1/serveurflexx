// frontend_react/app/__tests__/views/Landing.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock MainLayout to simply render children so we can test the page contents
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => (
  <div data-testid="layout">{children}</div>
));

// mock react-slick slider to avoid dealing with its internals in tests
jest.mock('react-slick', () => {
  const MockSlider = ({ children }: any) => <div data-testid="slider">{children}</div>;
  return {
    __esModule: true,
    default: MockSlider,
  };
});

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

// component under test
import Landing from '../../src/views/Landing';

describe('Landing view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ loading: false });
  });

  test('renders hero, features, plans and testimonials (slider)', () => {
    render(<Landing />);

    // hero - headline and domain input
    expect(screen.getByRole('heading', { name: /Launch Your Business with Powerful Cloud Solutions/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Find your domain/i)).toBeInTheDocument();

    // features - assert headings specifically to avoid matching paragraphs
    expect(screen.getByRole('heading', { name: /Why Choose Serveur Flex\?/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /High-Performance Servers/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /24\/7 Support/i })).toBeInTheDocument();

    // plans heading and price
    expect(screen.getByRole('heading', { name: /Our Plans/i })).toBeInTheDocument();
    expect(screen.getByText(/\$9.99\/mo/i)).toBeInTheDocument();

    // slider (test mock)
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  test('navigation buttons go to the expected routes', () => {
    render(<Landing />);

    const configureBtn = screen.getByText(/Configure Your Server/i);
    fireEvent.click(configureBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server');

    const pricingBtn = screen.getByText(/View Pricing/i);
    fireEvent.click(pricingBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  test('domain search form navigates to domain-search with encoded query', () => {
    render(<Landing />);

    const input = screen.getByPlaceholderText(/Find your domain/i) as HTMLInputElement;
    const searchBtn = screen.getByRole('button', { name: /Search/i });

    // type domain with spaces/special chars to ensure encoding happens
    fireEvent.change(input, { target: { value: 'example site.com' } });
    fireEvent.click(searchBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/domain-search?query=' + encodeURIComponent('example site.com'));
  });

  test('shows Loading... when context loading is true', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    render(<Landing />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
