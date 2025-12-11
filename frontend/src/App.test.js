import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Image Denoising Demo header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Image Denoising Demo/i);
  expect(headerElement).toBeInTheDocument();
});
