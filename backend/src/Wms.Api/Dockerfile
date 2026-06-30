FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/NuGet.Config ./backend/NuGet.Config
COPY backend/Wms.sln ./backend/Wms.sln
COPY backend/src/Wms.Api/Wms.Api.csproj ./backend/src/Wms.Api/
COPY backend/src/Wms.Application/Wms.Application.csproj ./backend/src/Wms.Application/
COPY backend/src/Wms.Domain/Wms.Domain.csproj ./backend/src/Wms.Domain/
COPY backend/src/Wms.Infrastructure/Wms.Infrastructure.csproj ./backend/src/Wms.Infrastructure/

RUN dotnet restore ./backend/Wms.sln --configfile ./backend/NuGet.Config

COPY backend ./backend

RUN dotnet publish ./backend/src/Wms.Api/Wms.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Wms.Api.dll"]
