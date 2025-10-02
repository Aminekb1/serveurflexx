// frontend_react/app/__tests__/views/Resources.test.tsx
import type { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Resources from '../../src/views/Resources/Resources';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// mock api (point to src/api)
jest.mock('../../src/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
import api from '../../src/api';

// mock AuthContext (point to src/context)
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../src/context/AuthContext';

describe('Resources view', () => {
  beforeEach(() => jest.resetAllMocks());

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  test('fetches and displays resources and available details', async () => {
    (useAuth as any).mockReturnValue({ user: { _id: 'u1' }, loading: false });

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/getAllRessources')) {
        return Promise.resolve({
          data: [
            {
              _id: 'r1',
              nom: 'Serv1',
              cpu: 2,
              ram: 4,
              stockage: 20,
              nombreHeure: 10,
              disponibilite: true,
              statut: 'Active',
              os: 'ubuntu',
              typeRessource: 'vm',
            },
          ],
        });
      }
      if (url.includes('/getAvailableResources')) {
        return Promise.resolve({ data: { cpu: 10, ram: 32, storage: 100 } });
      }
      if (url.includes('/getAvailableNetworks')) {
        return Promise.resolve({ data: [{ network: 'net1', name: 'Net One', type: 'vlan' }] });
      }
      if (url.includes('/getAvailableISOs')) {
        return Promise.resolve({ data: [{ datastore: 'ds1', path: '/iso.iso', fullPath: 'ds1:/iso.iso' }] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<Resources />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Resources')).toBeInTheDocument());
    expect(screen.getByText('Serv1')).toBeInTheDocument();
    expect(screen.getByText('CPU: 2 vCPUs')).toBeInTheDocument();
    expect(screen.getByText(/Available Resources/)).toBeInTheDocument();
    expect(screen.getByText('CPU: 10 vCPUs')).toBeInTheDocument();
  });

  test('create custom VM validation and creation', async () => {
    (useAuth as any).mockReturnValue({ user: { _id: 'u1' }, loading: false });

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/getAllRessources')) return Promise.resolve({ data: [] });
      if (url.includes('/getAvailableResources')) return Promise.resolve({ data: { cpu: 2, ram: 4, storage: 10 } });
      if (url.includes('/getAvailableNetworks')) return Promise.resolve({ data: [{ network: 'n1', name: 'N' }] });
      if (url.includes('/getAvailableISOs')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    (api.post as jest.Mock).mockImplementation((url: string, payload: any) => {
      if (url.includes('/createCustomVM')) {
        return Promise.resolve({
          data: {
            ressource: {
              _id: 'new1',
              nom: payload.nom,
              cpu: payload.cpu,
              ram: payload.ram,
              stockage: payload.stockage,
              nombreHeure: payload.nombreHeure,
              disponibilite: true,
              statut: 'Active',
              os: payload.os,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Resources />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('Resources')).toBeInTheDocument());

    // open create custom VM modal
    fireEvent.click(screen.getByRole('button', { name: /Create Custom VM/i }));

    // fill invalid values (exceed available or negative)
    fireEvent.change(screen.getByLabelText(/CPU \(vCPUs, Max:/i), { target: { value: '-1' } });
    fireEvent.change(screen.getByLabelText(/RAM \(GB, Max:/i), { target: { value: '-2' } });
    fireEvent.change(screen.getByLabelText(/Storage \(GB, Max:/i), { target: { value: '-3' } });
    fireEvent.change(screen.getByLabelText(/Hours/i), { target: { value: '0' } });

    // submit invalid form
    fireEvent.click(screen.getByRole('button', { name: /Create VM/i }));

    // --- CHANGEMENT : vérifier qu'il n'y a pas d'appel API et que la modal reste visible ---
    await waitFor(() => expect(api.post).not.toHaveBeenCalled());
    // cibler le heading du modal (role 'heading') — permet d'éviter l'ambiguïté du getByText()
    expect(screen.getByRole('heading', { name: /Create Custom VM/i })).toBeInTheDocument();
    // --- FIN DU CHANGEMENT ---

    // fix to valid values then submit
    fireEvent.change(screen.getByLabelText(/CPU \(vCPUs, Max:/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/RAM \(GB, Max:/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Storage \(GB, Max:/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Hours/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'VMTest' } });

    fireEvent.click(screen.getByRole('button', { name: /Create VM/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/ressource/createCustomVM', expect.any(Object)));
    await waitFor(() => expect(screen.getByText('VMTest')).toBeInTheDocument());
  });
});
