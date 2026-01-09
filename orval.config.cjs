module.exports = {
  'vue-auth': {
    input: './swagger/swagger.json',
    output: {
      mode: 'single',
      target: './src/api/endpoints.ts',
      client: 'vue-query',
      mock: true,
      override: {
        mutator: {
          path: './src/axios/index.ts',
          name: 'customInstance',
        },
        mock: {
          properties: {
            code: 200,
            message: '操作成功',
          },
        },
      },
    },
  },
};
