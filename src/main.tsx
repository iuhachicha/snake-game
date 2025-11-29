import { render } from 'preact';
import App from './App';
import './style.css';

const container = document.getElementById('app');

if (!container) {
  throw new Error('Failed to find the root element');
}

render(<App />, container);
