//import React from 'react';
import { render } from '@testing-library/react';
import Orders from '../../../src/views/Orders/Orders'; // chemin relatif corrigé

test('Orders component renders', () => {
  render(<Orders />);
});
