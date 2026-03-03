using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Interfaces
{
    public interface ICosmosRepository<T> where T : CosmosDocument
    {
        Task<T?> GetByIdAsync(string id, string partitionKey);

        Task<IEnumerable<T>> QueryAsync(
            string sql,
            Dictionary<string, object>? parameters = null);

        Task<T> CreateAsync(T document);

        Task<T> UpsertAsync(T document);

        Task DeleteAsync(string id, string partitionKey);
    }
}