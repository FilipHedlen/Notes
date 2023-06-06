import { handleLogin } from './login.js';
import { loadDocuments } from './notes.js';

document.querySelector('form').addEventListener('submit', handleLogin);

loadDocuments();