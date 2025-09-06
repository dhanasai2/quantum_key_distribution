import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QKDSimulator from '../../../src/components/QKDSimulator/QKDSimulator';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  );
};

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));

describe('QKDSimulator', () => {
  test('renders QKD simulator component', () => {
    renderWithTheme(<QKDSimulator />);
    expect(screen.getByText(/Quantum Key Distribution/i)).toBeInTheDocument();
  });

  test('allows message input', () => {
    renderWithTheme(<QKDSimulator />);
    const messageInput = screen.getByLabelText(/Message to Encrypt/i);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    expect(messageInput.value).toBe('Test message');
  });

  test('run QKD protocol button is enabled with message', () => {
    renderWithTheme(<QKDSimulator />);
    const messageInput = screen.getByLabelText(/Message to Encrypt/i);
    const runButton = screen.getByText(/Run QKD Protocol/i);
    
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    expect(runButton).not.toBeDisabled();
  });
});
