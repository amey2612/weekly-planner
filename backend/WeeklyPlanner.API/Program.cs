using Microsoft.Azure.Cosmos;
using WeeklyPlanner.API.Interfaces;
using WeeklyPlanner.API.Models;
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
builder.Services.AddSwaggerGen();

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

// register typed repositories with container names
builder.Services.AddScoped<ICosmosRepository<TeamMemberDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<TeamMemberDocument>(database, "TeamMembers");
});

builder.Services.AddScoped<ICosmosRepository<PlanningWeekDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<PlanningWeekDocument>(database, "PlanningWeeks");
});

builder.Services.AddScoped<ICosmosRepository<PlanItemDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<PlanItemDocument>(database, "PlanItems");
});

builder.Services.AddScoped<ICosmosRepository<BacklogItemDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<BacklogItemDocument>(database, "BacklogItems");
});

builder.Services.AddScoped<ICosmosRepository<ProgressUpdateDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<ProgressUpdateDocument>(database, "ProgressUpdates");
});

builder.Services.AddScoped<ICosmosRepository<NotificationDocument>>(provider =>
{
    var database = provider.GetRequiredService<Database>();
    return new CosmosRepository<NotificationDocument>(database, "Notifications");
});

// application services
builder.Services.AddScoped<ITeamMemberService, TeamMemberService>();
builder.Services.AddScoped<IBacklogService, BacklogService>();
builder.Services.AddScoped<IPlanningWeekService, PlanningWeekService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WeeklyPlanner.API v1"));
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
