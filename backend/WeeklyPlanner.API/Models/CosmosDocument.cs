using System.Text.Json.Serialization;

namespace WeeklyPlanner.API.Models
{
    public abstract class CosmosDocument
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("type")]
        public abstract string Type { get; }
    }
}
