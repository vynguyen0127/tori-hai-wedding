/**
 * Countdown component tests
 *
 * Why we test this component:
 *   - It has a time-dependent branch (past vs future date) that's easy to
 *     miss in manual testing
 *   - It uses setInterval — we verify the interval is cleaned up to prevent
 *     memory leaks (a common interview topic)
 *   - It has a hydration-safe lazy-init pattern we want to lock in
 *
 * We use Jest fake timers to control time without waiting for real seconds.
 * Note: use advanceTimersByTime instead of runAllTimers — runAllTimers loops
 * forever on setInterval since the interval never "ends".
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Countdown from '@/components/Countdown';

const WEDDING_DATE = new Date('2027-05-29T17:00:00').getTime();

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Countdown', () => {
  it('renders countdown units when time remains', () => {
    jest.setSystemTime(new Date(WEDDING_DATE - 5 * 24 * 60 * 60 * 1000));
    render(<Countdown />);

    // Let the initial useEffect setState flush
    act(() => { jest.advanceTimersByTime(0); });

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('shows "Today is the day" when the wedding date has passed', () => {
    jest.setSystemTime(new Date(WEDDING_DATE + 1000));
    render(<Countdown />);

    act(() => { jest.advanceTimersByTime(0); });

    expect(screen.getByText(/Today is the day/i)).toBeInTheDocument();
    expect(screen.queryByText('Days')).toBeNull();
  });

  it('shows a specific seconds value matching the time remaining', () => {
    // 65 seconds before wedding → 1 min 5 sec remaining → seconds display = "05"
    jest.setSystemTime(new Date(WEDDING_DATE - 65_000));
    render(<Countdown />);

    act(() => { jest.advanceTimersByTime(0); });

    // The seconds span should show "05" (65s remaining → 5 seconds in the current minute)
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('cleans up the interval on unmount', () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');
    jest.setSystemTime(new Date(WEDDING_DATE - 60_000));

    const { unmount } = render(<Countdown />);
    act(() => { jest.advanceTimersByTime(0); });
    unmount();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('transitions to "Today is the day" as time crosses zero', () => {
    jest.setSystemTime(new Date(WEDDING_DATE - 1500)); // 1.5 seconds before
    render(<Countdown />);

    act(() => { jest.advanceTimersByTime(0); });
    expect(screen.getByText('Days')).toBeInTheDocument(); // still counting down

    act(() => { jest.advanceTimersByTime(2000); }); // advance past the date
    expect(screen.getByText(/Today is the day/i)).toBeInTheDocument();
    expect(screen.queryByText('Days')).toBeNull();
  });
});
