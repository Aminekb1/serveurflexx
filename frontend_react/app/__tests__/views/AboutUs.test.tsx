// frontend_react/app/__tests__/views/AboutUs.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// mock MainLayout to just render children
jest.mock('../../src/layouts/MainLayout', () => ({ children }: any) => (
  <div data-testid="layout">{children}</div>
));

import AboutUs from '../../src/views/AboutUs';

describe('AboutUs page', () => {
  test('renders hero text and image', () => {
    render(<AboutUs />);

    expect(screen.getByText(/About Serveur Flex/i)).toBeInTheDocument();
    expect(
      screen.getByText(/high-performance cloud servers/i)
    ).toBeInTheDocument();
    expect(screen.getByAltText(/Cloud Server/i)).toBeInTheDocument();
  });

  test('navigates to register when clicking Get Started', () => {
    render(<AboutUs />);
    fireEvent.click(screen.getByText(/Get Started/i));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/register');
  });

  test('navigates to contact when clicking Contact Us', () => {
    render(<AboutUs />);
    fireEvent.click(screen.getByText(/Contact Us/i));
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });

  test('renders mission section', () => {
    render(<AboutUs />);

    // Utiliser getAllByText pour éviter l'erreur "multiple elements"
    const missionHeadings = screen.getAllByText(/Our Mission/i);
    expect(missionHeadings.length).toBeGreaterThan(0);

    // Vérifier le contenu unique
    expect(
      screen.getByText(/simplify cloud hosting/i)
    ).toBeInTheDocument();
  });
});
