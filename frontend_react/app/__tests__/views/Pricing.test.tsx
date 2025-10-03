// frontend_react/app/__tests__/views/Pricing.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock MainLayout
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => (
  <div data-testid="layout">{children}</div>
));

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
import Pricing from '../../src/views/Pricing';

describe('Pricing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ loading: false });
  });

  test('renders pricing hero and toggles yearly/monthly prices', () => {
    render(<Pricing />);

    expect(screen.getByText(/Affordable Plans for Every Need/i)).toBeInTheDocument();

    // Monthly values appear in elements that contain "TND/mo" — may be multiple nodes, so use getAllByText
    const monthlyPriceNodes = screen.getAllByText(/TND\/mo/i);
    expect(monthlyPriceNodes.length).toBeGreaterThan(0);
    // Assert at least one of the nodes contains the expected price strings
    expect(monthlyPriceNodes.some((n) => /9\.99/.test(n.textContent || ''))).toBeTruthy();
    expect(monthlyPriceNodes.some((n) => /19\.99/.test(n.textContent || ''))).toBeTruthy();
    expect(monthlyPriceNodes.some((n) => /39\.99/.test(n.textContent || ''))).toBeTruthy();

    // switch to yearly
    fireEvent.click(screen.getByText(/Yearly \(Save 10%\)/i));

    const yearlyNodes = screen.getAllByText(/TND\/yr/i);
    expect(yearlyNodes.length).toBeGreaterThan(0);
    expect(yearlyNodes.some((n) => /107\.89/.test(n.textContent || ''))).toBeTruthy();
    expect(yearlyNodes.some((n) => /215\.89/.test(n.textContent || ''))).toBeTruthy();
    expect(yearlyNodes.some((n) => /431\.89/.test(n.textContent || ''))).toBeTruthy();
  });

  test('Get Started buttons navigate with proper query params', () => {
    render(<Pricing />);

    fireEvent.click(screen.getAllByText(/Get Started/i)[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server?plan=basic&type=vps');

    fireEvent.click(screen.getAllByText(/Get Started/i)[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server?plan=pro&type=vps');

    fireEvent.click(screen.getAllByText(/Get Started/i)[2]);
    expect(mockNavigate).toHaveBeenCalledWith('/configure-server?plan=enterprise&type=vps');
  });

  test('shows loading when context loading is true', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    render(<Pricing />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
