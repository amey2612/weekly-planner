using Azure.Messaging.ServiceBus;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using WeeklyPlanner.Functions.Models;

namespace WeeklyPlanner.Functions
{
    public class WeekFrozenFunction
    {
        private readonly ILogger<WeekFrozenFunction> _logger;

        public WeekFrozenFunction(ILogger<WeekFrozenFunction> logger)
        {
            _logger = logger;
        }

        [Function("WeekFrozenFunction")]
        public async Task Run(
            [ServiceBusTrigger("week-frozen", Connection = "ServiceBusConnection")]
            ServiceBusReceivedMessage message,
            ServiceBusMessageActions messageActions)
        {
            var body = message.Body.ToString();
            _logger.LogInformation("Week Frozen Event Received: {Message}", body);

            try
            {
                var evt = JsonSerializer.Deserialize<WeekFrozenEvent>(body);
                if (evt != null)
                {
                    _logger.LogInformation(
                        "Week {WeekId} was frozen at {FrozenAt}",
                        evt.WeekId,
                        evt.FrozenAt);
                }

                await messageActions.CompleteMessageAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process WeekFrozenEvent");
                await messageActions.DeadLetterMessageAsync(
                    message,
                    deadLetterReason: "ProcessingFailed",
                    deadLetterErrorDescription: ex.Message);
            }
        }
    }
}
