export const environment = {
  production: false,

  // Your .NET API running locally
  apiUrl: 'http://localhost:5000/api',

  // From your Notepad — Azure AD values
  tenantId: '4690aeab-5d8c-43cf-9f52-0683350fe19f',
  spaClientId: '39819d96-66c4-43b3-b909-9cfa93d646a7',
  apiClientId: 'e4e42f66-13f4-41ca-b945-c515804015fd',

  // Application Insights
  appInsightsConnectionString: 'InstrumentationKey=ff604cc4-3436-4773-836f-08ca235102e8;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=2509d64a-c4d3-4b16-9896-b93061056814'
};
