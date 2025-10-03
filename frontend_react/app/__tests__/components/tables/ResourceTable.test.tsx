// frontend_react/app/__tests__/components/tables/ResourceTable.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock flowbite-react minimal implementation for tests
jest.mock('flowbite-react', () => {
  const Table: any = ({ children }: any) => <table>{children}</table>;
  Table.Head = ({ children }: any) => <thead>{children}</thead>;
  Table.HeadCell = ({ children, className }: any) => <th className={className}>{children}</th>;
  Table.Body = ({ children, className }: any) => <tbody className={className}>{children}</tbody>;
  Table.Row = ({ children }: any) => <tr>{children}</tr>;
  Table.Cell = ({ children, className }: any) => <td className={className}>{children}</td>;

  const Badge = ({ children }: any) => <span data-testid="badge">{children}</span>;

  // Dropdown mock with Dropdown.Item attached
  const Dropdown = ({ children, renderTrigger }: any) => (
    <div>
      <div role="button" data-testid="dropdown-trigger">
        {renderTrigger ? renderTrigger() : null}
      </div>
      <div data-testid="dropdown-children">{children}</div>
    </div>
  );

  const DropdownItem = ({ children, onClick }: any) => (
    <div role="button" onClick={onClick}>
      {children}
    </div>
  );

  // attach Item to Dropdown so <Dropdown.Item> works
  (Dropdown as any).Item = DropdownItem;

  return { Table, Badge, Dropdown, DropdownItem };
});

// Mock iconify/react
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: any) => <span data-testid="icon">{icon}</span>,
}));

// Mock react-icons (dots)
jest.mock('react-icons/hi', () => ({
  HiOutlineDotsVertical: () => <span data-testid="dots">⋮</span>,
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// component under test
import { ResourceTable } from '../../../src/components/tables/RessourceTable';

describe('ResourceTable', () => {
  const sampleResources = [
    {
      _id: 'r1',
      id: 'r1',
      nom: 'Res1',
      cpu: '2',
      ram: '4',
      stockage: '20',
      nombreHeure: 10,
      disponibilite: true,
      statut: 'Prêt',
      typeRessource: 'vm',
    },
  ];

  // keep original fetch to restore later (may be undefined)
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    // ensure global.fetch exists and is a jest mock
    if (!(global as any).fetch) {
      (global as any).fetch = jest.fn();
    }
  });

  afterEach(() => {
    // restore original fetch (could be undefined)
    (global as any).fetch = originalFetch;
  });

  test('fetches and displays resources', async () => {
    // mock fetch for GET /api/resources
    (global as any).fetch.mockImplementation((input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.endsWith('/api/resources') && (!init || !init.method)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleResources),
        } as any);
      }
      // fallback
      return Promise.resolve({ ok: false } as any);
    });

    render(<ResourceTable />);

    // wait for resource name to appear
    expect(await screen.findByText('Res1')).toBeInTheDocument();
    // assert some columns
    expect(screen.getByText('vm')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    // badge shows Disponibilité text (French) - could be "Disponible" or "Prêt" depending on implementation
    expect(screen.getAllByTestId('badge')[0]).toHaveTextContent(/Disponible|Prêt|Non disponible/i);
  });

  test('deletes a resource when Supprimer is clicked', async () => {
    // First call: GET /api/resources -> return sampleResources
    // Second call: DELETE /api/resources/r1 -> return ok true
    (global as any).fetch.mockImplementation((input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input);

      if (url.endsWith('/api/resources') && (!init || !init.method)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleResources),
        } as any);
      }

      if (url.endsWith(`/api/resources/r1`) && init && init.method === 'DELETE') {
        return Promise.resolve({ ok: true } as any);
      }

      return Promise.resolve({ ok: false } as any);
    });

    render(<ResourceTable />);

    expect(await screen.findByText('Res1')).toBeInTheDocument();

    // The mocked Dropdown renders its children immediately under data-testid="dropdown-children"
    // find the "Supprimer" text inside the dropdown children
    const supprimerBtn = screen.getByText(/Supprimer/i);
    fireEvent.click(supprimerBtn);

    // wait for the resource to be removed from DOM
    await waitFor(() => {
      expect(screen.queryByText('Res1')).not.toBeInTheDocument();
    });

    // ensure DELETE was called
    expect((global as any).fetch).toHaveBeenCalledWith(`/api/resources/r1`, expect.objectContaining({ method: 'DELETE' }));
  });
});
