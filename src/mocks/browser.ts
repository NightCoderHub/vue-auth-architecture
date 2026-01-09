import { setupWorker } from 'msw/browser';
import { getNodeAPIServerDocumentationMock } from '../api/endpoints';

export const worker = setupWorker(...getNodeAPIServerDocumentationMock());
