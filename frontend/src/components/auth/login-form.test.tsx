import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    setUser: vi.fn(),
  }),
}));

const mockLogin = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      login: (...args: unknown[]) => mockLogin(...args),
    },
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  it('should render login form', () => {
    render(<LoginForm onSwitchToRegister={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('should call login API with correct data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: '1', email: 'test@example.com' }
    });

    render(<LoginForm onSwitchToRegister={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    render(<LoginForm onSwitchToRegister={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'wrong@email.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword');

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  it('should show success message on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: '1', email: 'test@example.com' }
    });

    render(<LoginForm onSwitchToRegister={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Login exitoso. Redirigiendo...')).toBeInTheDocument();
    });
  });

  it('should call onSwitchToRegister when clicking register link', async () => {
    const user = userEvent.setup();
    const mockSwitchFn = vi.fn();

    render(<LoginForm onSwitchToRegister={mockSwitchFn} />);

    await user.click(screen.getByText('Regístrate'));

    expect(mockSwitchFn).toHaveBeenCalled();
  });

  it('should disable button while loading', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<LoginForm onSwitchToRegister={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled();
  });
});
