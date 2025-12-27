import { http, HttpResponse } from 'msw';

// 定义模拟接口
export const handlers = [
  // 拦截 GET 请求
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Test User',
    });
  })
];