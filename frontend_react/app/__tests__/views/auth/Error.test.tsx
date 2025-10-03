// frontend_react/app/__tests__/views/auth/Error.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock image import used in the component (chemin relatif depuis ce test vers src)
jest.mock('../../../src/assets/images/backgrounds/errorimg.svg', () => 'mock-error-img');

// react-router Link is imported as "react-router" in your component; make a robust mock
jest.mock('react-router', () => {
  // Return a Link component that accepts either `to` or `href` (flowbite may pass href)
  return {
    Link: ({ children, to, href, ...rest }: any) => {
      const resolvedHref = to ?? href ?? '#';
      // ensure anchor has href so testing-library treats it as a link role
      return (
        <a href={resolvedHref} {...rest}>
          {children}
        </a>
      );
    },
  };
});

// Component under test
import Error from '../../../src/views/auth/error/Error';

describe('Error component', () => {
  test('renders error view with image, headings and a link button', () => {
    render(<Error />);

    // heading
    expect(screen.getByText(/Opps!!!/i)).toBeInTheDocument();
    // subheading text
    expect(screen.getByText(/This page you are looking for could not be found/i)).toBeInTheDocument();
    // Go back button as a link (ensure it has href "/")
    const goBack = screen.getByRole('link', { name: /Go Back to Home/i });
    expect(goBack).toBeInTheDocument();
    expect((goBack as HTMLAnchorElement).getAttribute('href')).toBe('/');
  });
});
