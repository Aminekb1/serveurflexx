// frontend_react/app/__tests__/components/tables/CommandesTable.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock flowbite-react minimal implementation for tests (same pattern)
jest.mock('flowbite-react', () => {
  const Table: any = ({ children }: any) => <table>{children}</table>;
  Table.Head = ({ children }: any) => <thead>{children}</thead>;
  Table.HeadCell = ({ children, className }: any) => <th className={className}>{children}</th>;
  Table.Body = ({ children, className }: any) => <tbody className={className}>{children}</tbody>;
  Table.Row = ({ children }: any) => <tr>{children}</tr>;
  Table.Cell = ({ children, className }: any) => <td className={className}>{children}</td>;

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

  return { Table, Dropdown, DropdownItem };
});

// Mock iconify/react
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: any) => <span data-testid="icon">{icon}</span>,
}));

// Mock react-icons
jest.mock('react-icons/hi', () => ({
  HiOutlineDotsVertical: () => <span data-testid="dots">⋮</span>,
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// component under test (correct relative path)
import { OrderTable } from '../../../src/components/tables/CommandesTable';

describe('OrderTable (CommandesTable)', () => {
  const sampleOrders = [
    {
      _id: 'o1',
      client: { _id: 'u1', name: 'Client A', email: 'a@example.com' },
      ressources: [{ _id: 'r1', nom: 'Res1' }],
      dateCommande: '2025-10-03T00:00:00.000Z',
    },
  ];

  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    if (!(global as any).fetch) {
      (global as any).fetch = jest.fn();
    }
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  test('fetches and renders orders', async () => {
    (global as any).fetch.mockImplementation((input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.endsWith('/api/commandes') && (!init || !init.method)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleOrders),
        } as any);
      }
      return Promise.resolve({ ok: false } as any);
    });

    render(<OrderTable />);

    // Wait for order client name
    expect(await screen.findByText('Client A')).toBeInTheDocument();
    // Date should be formatted using toLocaleDateString
    expect(screen.getByText(new Date(sampleOrders[0].dateCommande).toLocaleDateString())).toBeInTheDocument();
    // resource name
    expect(screen.getByText('Res1')).toBeInTheDocument();
  });

  test('deletes an order when Supprimer is clicked', async () => {
    (global as any).fetch.mockImplementation((input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.endsWith('/api/commandes') && (!init || !init.method)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleOrders),
        } as any);
      }

      if (url.endsWith(`/api/commandes/o1`) && init && init.method === 'DELETE') {
        return Promise.resolve({ ok: true } as any);
      }

      return Promise.resolve({ ok: false } as any);
    });

    render(<OrderTable />);

    expect(await screen.findByText('Client A')).toBeInTheDocument();

    const supprimer = screen.getByText(/Supprimer/i);
    fireEvent.click(supprimer);

    // wait for the order to be removed
    await waitFor(() => {
      expect(screen.queryByText('Client A')).not.toBeInTheDocument();
    });

    // ensure fetch called for delete
    expect((global as any).fetch).toHaveBeenCalledWith(`/api/commandes/o1`, expect.objectContaining({ method: 'DELETE' }));
  });
});
