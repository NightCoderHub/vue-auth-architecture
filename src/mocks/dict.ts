import { http, HttpResponse, delay } from 'msw';

const dictMap: Record<string, any[]> = {
  user_status: [
    { label: '正常', value: '1', listClass: 'success', cssClass: '' },
    { label: '禁用', value: '0', listClass: 'danger', cssClass: '' }
  ],
  gender: [
    { label: '男', value: '1', listClass: '', cssClass: '' },
    { label: '女', value: '2', listClass: '', cssClass: '' },
    { label: '未知', value: '0', listClass: 'info', cssClass: '' }
  ],
  order_status: [
    { label: '待支付', value: 'pending', listClass: 'warning' },
    { label: '已支付', value: 'paid', listClass: 'success' },
    { label: '已发货', value: 'shipped', listClass: 'primary' },
    { label: '已完成', value: 'completed', listClass: 'success' },
    { label: '已取消', value: 'cancelled', listClass: 'info' }
  ]
};

export const dictHandlers = [
  http.get('*/dict/batch', async ({ request }) => {
    await delay(500); // 模拟网络延迟
    const url = new URL(request.url);
    const types = url.searchParams.get('types');

    if (!types) {
      return new HttpResponse(
        JSON.stringify({
          code: 400,
          message: '缺少 types 参数',
          data: null
        }),
        { status: 400 }
      );
    }

    const typeList = types.split(',');
    const result: Record<string, any[]> = {};

    typeList.forEach((type) => {
      if (dictMap[type]) {
        result[type] = dictMap[type];
      } else {
        result[type] = [];
      }
    });

    return new HttpResponse(
      JSON.stringify({
        code: 200,
        message: '操作成功',
        data: result
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  })
];
