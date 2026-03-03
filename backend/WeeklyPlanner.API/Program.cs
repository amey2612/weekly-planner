using Microsoft.Azure.Cosmos;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Repositories;
using WeeklyPlanner.API.Services;

var builder = WebApplication.CreateBuilder(args);

// configuration for Cosmos
// settings should be defined in appsettings.json or user secrets under "Cosmos" section
// e.g. "Cosmos": { "Endpoint": "...", "Key": "...", "Database": "WeeklyPlanner" }

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Cosmos DB setup
builder.Services.AddSingleton(s =>
{
    var config = s.GetRequiredService<IConfiguration>();
    var endpoint = config["Cosmos:Endpoint"] ?? throw new InvalidOperationException("Cosmos endpoint not configured");
    var key = config["Cosmos:Key"] ?? throw new InvalidOperationException("Cosmos key not configured");
    return new CosmosClient(endpoint, key);
});

builder.Services.AddSingleton(s =>
{
    var config = s.GetRequiredService<IConfiguration>();
    var databaseName = config["Cosmos:Database"] ?? throw new InvalidOperationException("Cosmos database not configured");
    var client = s.GetRequiredService<CosmosClient>();
    return client.GetDatabase(databaseName);
});

// register generic repository
builder.Services.AddScoped(typeof(ICosmosRepository<>), typeof(CosmosRepository<>));

// application services
builder.Services.AddSingleton<ITeamMemberService, TeamMemberService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
