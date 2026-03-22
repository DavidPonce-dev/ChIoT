import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/register-form';

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

const mockRegister = vi.fn();
const mockLogin = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      register: (...args: unknown[]) => mockRegister(...args),
      login: (...args: unknown[]) => mockLogin(...args),
    },
  },
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockReset();
    mockLogin.mockReset();
  });

  it('should render register form with all fields', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'password123');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'differentpassword');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('should show error when password is too short', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], '12345');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], '12345');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
  });

  it('should call register API on submit', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({ success: true });
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: '1', email: 'test@example.com' }
    });

    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'password123');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'password123');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error on register failure', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('El usuario ya existe'));

    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'existing@email.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'password123');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'password123');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El usuario ya existe')).toBeInTheDocument();
    });
  });

  it('should show success message and auto-login on success', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({ success: true });
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: '1', email: 'test@example.com' }
    });

    render(<RegisterForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'password123');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'password123');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('¡Cuenta creada! Iniciando sesión...')).toBeInTheDocument();
    });
  });

  it('should call onSwitchToLogin when clicking login link', async () => {
    const user = userEvent.setup();
    const mockSwitchFn = vi.fn();

    render(<RegisterForm onSwitchToLogin={mockSwitchFn} />);

    await user.click(screen.getByText('Inicia Sesión'));

    expect(mockSwitchFn).toHaveBeenCalled();
  });
});
