import React from 'react';
import HelloWorld from '../Hello';
import { render, screen } from '@testing-library/react';


describe("HelloWorld", () => {
    it("checks if Hello, World! is in the component", () => {
      render(<HelloWorld />); 
      const linkElement = screen.getByText(/Hello, World!/i); 
      expect(linkElement).toBeInTheDocument(); 
    });
  });