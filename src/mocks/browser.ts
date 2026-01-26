import { setupWorker } from 'msw/browser';
import { getNodeAPIServerDocumentationMock } from '../api/endpoints';
import { dictHandlers } from './dict';

export const worker = setupWorker(...getNodeAPIServerDocumentationMock(), ...dictHandlers);
