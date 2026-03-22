import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/navbar';

const mockLogout = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show login and register buttons when not authenticated', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Comenzar')).toBeInTheDocument();
  });

  it('should show brand name', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('chiot platform')).toBeInTheDocument();
  });

  it('should show navigation links when not authenticated', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('Características')).toBeInTheDocument();
    expect(screen.getByText('Cómo funciona')).toBeInTheDocument();
    expect(screen.getByText('Precios')).toBeInTheDocument();
  });

  it('should show Dashboard link when authenticated', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should show user email when authenticated', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show logout dropdown when clicking user button', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    const userButton = screen.getByText('test@example.com');
    await userEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    });
  });

  it('should call logout when clicking logout button', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    const userButton = screen.getByText('test@example.com');
    await userEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Cerrar sesión'));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should show mobile menu toggle', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should show mobile menu when toggle clicked', async () => {
    const { useAuthStore } = await import('@/store/auth');
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Navbar />);

    const menuButton = screen.getByRole('button');
    await userEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getAllByText('Características')).toHaveLength(2);
    });
  });
});
