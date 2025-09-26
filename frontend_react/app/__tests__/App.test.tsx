//import React from 'react';
//import { render, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import App from '../src/App'; // chemin relatif vers src/App

test('renders app without crashing', () => {
  render(<App />);
  // Si App affiche un texte connu, vérifie-le ; sinon, test juste l'existence
  expect(document.body).toBeDefined();
});
