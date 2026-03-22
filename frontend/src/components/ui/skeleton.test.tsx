import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, DeviceCardSkeleton, DashboardSkeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('should render skeleton', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render skeleton with custom class', () => {
    const { container } = render(<Skeleton className="w-32 h-4" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('w-32', 'h-4');
  });
});

describe('DeviceCardSkeleton', () => {
  it('should render device card skeleton structure', () => {
    const { container } = render(<DeviceCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('DashboardSkeleton', () => {
  it('should render dashboard skeleton structure', () => {
    const { container } = render(<DashboardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
