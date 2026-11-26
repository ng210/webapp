using Microsoft.Extensions.Options;

public sealed class ApiTokenOptions
{
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
    public int ExpirationMinutes { get; set; } = 60;
    public int ClockSkewSeconds { get; set; } = 30;

    public string[] Claims { get; set; } = [];
}