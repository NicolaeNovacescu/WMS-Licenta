namespace Wms.Application.Authentication.Models;

public sealed record LoginCommand(string UserName, string Password);
