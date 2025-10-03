// frontend_react/app/__tests__/views/ResourcesSelection.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// mock react-router-dom useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// mock api: provide factory inline so jest hoisting won't reference a not-yet-initialized variable
jest.mock('../../src/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// now require the mocked module so we can configure/get its mock functions
const mockApi = require('../../src/api');

// component under test
import ResourcesSelection from '../../src/views/ResourcesSelection';

describe('ResourcesSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ loading: false, user: null });
  });

  test('renders available resources and available resources panel', async () => {
    (mockApi.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            _id: 'r1',
            nom: 'Res1',
            typeRessource: 'vm',
            cpu: 2,
            ram: 4,
            stockage: 10,
            nombreHeure: 1,
            disponibilite: true,
            os: 'ubuntu',
          },
        ],
      })
      .mockResolvedValueOnce({ data: { cpu: 10, ram: 32, storage: 100 } })
      .mockResolvedValueOnce({
        data: [{ network: 'n1', name: 'Net One', type: 'vlan' }],
      })
      .mockResolvedValueOnce({ data: [] });

    render(<ResourcesSelection />);

    expect(await screen.findByText(/Select Resources/i)).toBeInTheDocument();
    expect(await screen.findByText(/Available Resources/i)).toBeInTheDocument();

    expect(await screen.findByText('Res1')).toBeInTheDocument();
    expect(screen.getByText(/CPU:/i)).toBeInTheDocument();
    expect(screen.getByText(/RAM:/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage:/i)).toBeInTheDocument();
  });

  test('handleProceed navigates to register when not logged in', async () => {
    (mockApi.get as jest.Mock)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: { cpu: 1, ram: 1, storage: 1 } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<ResourcesSelection />);

    await screen.findByText(/Select Resources/i);

    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/register');
  });

  test('when logged in and selected resource + duration navigates to Payment', async () => {
    (mockApi.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            _id: 'r2',
            nom: 'Res2',
            typeRessource: 'server',
            cpu: 4,
            ram: 16,
            stockage: 100,
            nombreHeure: 1,
            disponibilite: true,
            os: 'linux',
          },
        ],
      })
      .mockResolvedValueOnce({ data: { cpu: 20, ram: 64, storage: 1000 } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    mockUseAuth.mockReturnValue({ loading: false, user: { _id: 'u1' } });

    render(<ResourcesSelection />);

    // wait for the resource card to appear
    expect(await screen.findByText('Res2')).toBeInTheDocument();

    // select resource checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // set duration input — locate the label then find the associated numeric input (robust vs other number inputs like minPrice)
    const durationLabel = screen.getByText(/Duration \(Hours\)/i);
    const durationInput = durationLabel.parentElement?.querySelector('input[type="number"]') as HTMLInputElement;
    expect(durationInput).toBeTruthy();
    fireEvent.change(durationInput, { target: { value: '2' } });

    // click proceed
    fireEvent.click(screen.getByText(/Proceed to Payment/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Payment', {
        state: { resources: ['r2'], duration: 2 },
      });
    });
  });

  test('create custom VM flow posts and updates resources list', async () => {
    (mockApi.get as jest.Mock)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: { cpu: 10, ram: 10, storage: 100 } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    mockUseAuth.mockReturnValue({ loading: false, user: { _id: 'u1' } });

    (mockApi.post as jest.Mock).mockResolvedValueOnce({
      data: {
        ressource: {
          _id: 'r-new',
          nom: 'Custom1',
          typeRessource: 'vm',
          cpu: 1,
          ram: 1,
          stockage: 10,
          nombreHeure: 1,
          disponibilite: true,
          os: 'ubuntu',
        },
      },
    });

    render(<ResourcesSelection />);

    await screen.findByText(/Select Resources/i);

    fireEvent.click(screen.getByText(/Create Custom VM/i));

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Custom1' },
    });
    fireEvent.change(screen.getByLabelText(/CPU \(vCPUs/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/RAM \(GB/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Storage \(GB/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Hours/i), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByText(/Create VM/i));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/ressource/createCustomVM',
        expect.objectContaining({
          nom: 'Custom1',
          cpu: 1,
          ram: 1,
          stockage: 10,
          nombreHeure: 1,
          clientId: 'u1',
        })
      );
    });

    expect(await screen.findByText('Custom1')).toBeInTheDocument();
  });
});
