import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// 使用定义的 handlers 初始化服务器
export const server = setupServer(...handlers);