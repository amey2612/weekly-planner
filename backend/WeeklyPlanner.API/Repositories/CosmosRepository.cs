using System.Net;
using Microsoft.Azure.Cosmos;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Repositories
{
    public class CosmosRepository<T> : ICosmosRepository<T>
        where T : CosmosDocument
    {
        private readonly Container _container;

        public CosmosRepository(Database database, string containerName)
        {
            _container = database.GetContainer(containerName);
        }

        public async Task<T?> GetByIdAsync(string id, string partitionKey)
        {
            try
            {
                var response = await _container.ReadItemAsync<T>(
                    id,
                    new PartitionKey(partitionKey));

                return response.Resource;
            }
            catch (CosmosException ex)
                when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<IEnumerable<T>> QueryAsync(
            string sql,
            Dictionary<string, object>? parameters = null)
        {
            var queryDef = new QueryDefinition(sql);

            if (parameters != null)
            {
                foreach (var p in parameters)
                {
                    queryDef = queryDef.WithParameter(p.Key, p.Value);
                }
            }

            var results = new List<T>();
            var iterator = _container.GetItemQueryIterator<T>(queryDef);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response.Resource);
            }

            return results;
        }

        public async Task<T> CreateAsync(T document)
        {
            var response = await _container.CreateItemAsync(document);
            return response.Resource;
        }

        public async Task<T> UpsertAsync(T document)
        {
            var response = await _container.UpsertItemAsync(document);
            return response.Resource;
        }

        public async Task DeleteAsync(string id, string partitionKey)
        {
            await _container.DeleteItemAsync<T>(
                id,
                new PartitionKey(partitionKey));
        }
    }
}