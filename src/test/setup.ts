import { beforeAll, afterEach, afterAll } from 'vitest';
import { config } from '@vue/test-utils';
import { server } from './mocks/server';

// 1. 启动 MSW 服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// 2. 每个测试用例结束后重置
afterEach(() => {
  server.resetHandlers();
  // 确保测试后清理 body
  document.body.innerHTML = '';
});

// 3. 所有测试结束后关闭服务器
afterAll(() => server.close());

/**
 * 4. 配置 Vue Test Utils 的全局默认值 (可选)
 * 如果你有一些全局组件、指令或插件，可以在这里统一定义
 */
config.global.stubs = {
  // 例如：全局 Mock 掉一些复杂的第三方组件
  // 'v-chart': true
};