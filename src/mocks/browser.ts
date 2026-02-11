import { setupWorker } from 'msw/browser';
import { dictHandlers } from './dict';

export const worker = setupWorker(...dictHandlers);
