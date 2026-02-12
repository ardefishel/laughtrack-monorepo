import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SetCard } from '@/components/sets/SetCard';
import type { RawJokeSet } from '@laughtrack/shared-types';

const mockJokeSet: RawJokeSet = {
  id: '1',
  title: 'Test Set',
  description: 'A test description',
  status: 'draft',
  duration: 30,
  place: 'Comedy Club',
  created_at: Date.now(),
  updated_at: Date.now(),
};

describe('SetCard', () => {
  it('renders correctly with all props', () => {
    const onPress = jest.fn();
    render(<SetCard jokeSet={mockJokeSet} onPress={onPress} />);

    expect(screen.getByText('Test Set')).toBeTruthy();
    expect(screen.getByText('A test description')).toBeTruthy();
    expect(screen.getByText('30 min')).toBeTruthy();
    expect(screen.getByText('Comedy Club')).toBeTruthy();
  });

  it('renders with minimal props', () => {
    const minimalSet: RawJokeSet = {
      id: '2',
      title: 'Minimal Set',
      status: 'performed',
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const onPress = jest.fn();
    render(<SetCard jokeSet={minimalSet} onPress={onPress} />);

    expect(screen.getByText('Minimal Set')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<SetCard jokeSet={mockJokeSet} onPress={onPress} />);

    const card = screen.getByText('Test Set');
    fireEvent.press(card);

    expect(onPress).toHaveBeenCalledWith(mockJokeSet);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows "Untitled Set" when title is empty', () => {
    const untitledSet: RawJokeSet = {
      id: '3',
      title: '',
      status: 'killed',
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const onPress = jest.fn();
    render(<SetCard jokeSet={untitledSet} onPress={onPress} />);

    expect(screen.getByText('Untitled Set')).toBeTruthy();
  });

  it('formats duration correctly for hours', () => {
    const longSet: RawJokeSet = {
      id: '4',
      title: 'Long Set',
      status: 'draft',
      duration: 90,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const onPress = jest.fn();
    render(<SetCard jokeSet={longSet} onPress={onPress} />);

    expect(screen.getByText('1h 30m')).toBeTruthy();
  });
});
