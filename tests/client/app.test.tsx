import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../../client/src/pages/Login';

test('renders Home component without crashing', () => {
  render(<Login />);
  expect(screen.getByText('Log')).toBeInTheDocument();
});