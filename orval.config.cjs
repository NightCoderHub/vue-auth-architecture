module.exports = {
  'vue-auth': {
    input: './swagger/swagger.json',
    output: {
      mode: 'single',
      target: './src/api/endpoints.ts',
      client: 'vue-query',
      mock: false,
      override: {
        mutator: {
          path: './src/axios/index.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
