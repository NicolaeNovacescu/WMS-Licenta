# Sistem web de management operational al depozitului

## Repository cod sursa

Codul sursa complet al aplicatiei este disponibil la:

```text
https://github.com/NicolaeNovacescu/WMS-Licenta
```

## Descriere proiect

Proiectul reprezinta o aplicatie web de tip WMS pentru managementul operational al unui depozit. Aplicatia urmareste trasabilitatea stocului, separarea fluxurilor logistice si controlul accesului pe roluri.

Sistemul include functionalitati pentru autentificare, administrare date de baza, configurare depozit, vizualizare stoc, fluxuri inbound, transfer, replenishment, outbound, picking, shipment, inventariere, audit si export CSV.

## Livrabile

Repository-ul contine:

- codul sursa al backend-ului ASP.NET Core Web API;
- codul sursa al frontend-ului Next.js;
- migrarile Entity Framework Core;
- proiectele de testare;
- fisierele de configurare pentru rularea cu Docker;
- configuratia pentru baza de date PostgreSQL;
- instructiuni de instalare, compilare si rulare a aplicatiei.

Repository-ul nu include fisiere binare compilate sau directoare generate automat, precum `bin/`, `obj/`, `node_modules/`, `.next/`, `dist/`, `build/` sau `publish/`.

## Tehnologii utilizate

Aplicatia foloseste urmatoarele tehnologii:

- ASP.NET Core Web API pentru backend;
- Entity Framework Core pentru accesul la date;
- PostgreSQL pentru baza de date;
- Next.js, React si TypeScript pentru frontend;
- Tailwind CSS pentru interfata web;
- JWT si refresh tokens pentru autentificare;
- Docker si Docker Compose pentru rularea aplicatiei in containere.

## Variante de rulare

Aplicatia poate fi rulata in doua moduri:

1. **Rulare cu Docker Compose**
2. **Rulare locala fara Docker**

## Rulare cu Docker Compose

### Cerinte necesare

Pentru rularea cu Docker sunt necesare:

- Windows 10/11;
- PowerShell;
- Docker Desktop;
- Docker Compose, inclus in Docker Desktop;
- Git, optional, doar pentru clonarea repository-ului.

Pentru verificarea instalarii:

```powershell
docker --version
docker compose version
```

Docker Desktop trebuie sa fie pornit inainte de rularea aplicatiei.

### Clonarea sau descarcarea proiectului

Varianta cu Git:

```powershell
git clone https://github.com/NicolaeNovacescu/WMS-Licenta.git
cd WMS-Licenta
```

Varianta fara Git:

1. Se descarca proiectul din GitHub folosind `Code -> Download ZIP`.
2. Se dezarhiveaza arhiva.
3. Se deschide PowerShell in folderul proiectului.

### Configurare Docker

Fisierul folosit pentru variabilele de mediu este:

```text
infra/docker/.env.example
```

Exemplu de configurare:

```env
FRONTEND_PORT=3000
BACKEND_PORT=8080
POSTGRES_PORT=15432
POSTGRES_DB=wms
POSTGRES_USER=wms
POSTGRES_PASSWORD=change-me
NEXT_PUBLIC_API_BASE_URL=http://backend:8080
```

In `infra/docker/compose.yml`, variabila pentru API trebuie sa foloseasca sintaxa Docker Compose corecta:

```yaml
NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-http://backend:8080}
```

### Pornirea aplicatiei

Din radacina proiectului:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml up --build
```

La prima rulare, procesul poate dura mai mult, deoarece se descarca imaginile si se construiesc containerele.

Dupa pornire, aplicatia se acceseaza in browser la:

```text
http://localhost:3000
```

Backend-ul este disponibil la:

```text
http://localhost:8080
```

Optional, se poate verifica Swagger la:

```text
http://localhost:8080/swagger
```

### Verificarea containerelor pornite

Intr-un PowerShell separat:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml ps
docker ps
```

Ar trebui sa apara containere pentru:

- frontend;
- backend;
- postgres.

### Oprirea aplicatiei

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml down
```

### Resetarea completa a bazei de date Docker

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml down -v
```

Atentie: aceasta comanda sterge volumul PostgreSQL si datele salvate local.

## Rulare locala fara Docker

### Cerinte necesare

Pentru rularea locala sunt necesare:

- .NET SDK 9;
- Node.js 20 sau mai nou;
- npm;
- PostgreSQL 16;
- PowerShell.

Verificarea instalarilor:

```powershell
dotnet --version
node --version
npm.cmd --version
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
```

### Deblocarea fisierelor descarcate ca ZIP

Daca proiectul a fost descarcat de pe GitHub ca arhiva ZIP, Windows poate bloca unele fisiere. Din radacina proiectului se ruleaza:

```powershell
Get-ChildItem -Recurse -File | Unblock-File
```

### Crearea bazei de date PostgreSQL

Se deschide PowerShell si se ruleaza:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

Dupa introducerea parolei pentru utilizatorul `postgres`, in consola PostgreSQL se ruleaza:

```sql
CREATE DATABASE wms;
CREATE USER wms WITH PASSWORD 'wms';
ALTER DATABASE wms OWNER TO wms;
GRANT ALL PRIVILEGES ON DATABASE wms TO wms;
\q
```

Daca utilizatorul `wms` exista deja, se poate folosi:

```sql
ALTER USER wms WITH PASSWORD 'wms';
ALTER DATABASE wms OWNER TO wms;
GRANT ALL PRIVILEGES ON DATABASE wms TO wms;
\q
```

### Instalarea dependentelor backend

Din radacina proiectului:

```powershell
cd backend
dotnet restore Wms.sln
dotnet tool restore
```

### Aplicarea migrarilor bazei de date

Din folderul `backend`:

```powershell
dotnet ef database update --project src\Wms.Infrastructure --startup-project src\Wms.Api
```

Daca totul este configurat corect, comanda trebuie sa se finalizeze cu mesajul:

```text
Done.
```

### Pornirea backend-ului

Din folderul `backend`:

```powershell
dotnet run --project src\Wms.Api
```

Backend-ul trebuie lasat pornit. In terminal trebuie sa apara o linie de forma:

```text
Now listening on: http://localhost:5080
```

### Configurarea frontend-ului

Intr-un terminal PowerShell separat, se intra in folderul `frontend`:

```powershell
cd "..\frontend"
```

Se creeaza fisierul `.env.local`:

```powershell
Set-Content -Path .env.local -Value "NEXT_PUBLIC_API_BASE_URL=http://localhost:5080"
```

Acest fisier indica frontend-ului adresa backend-ului local.

### Instalarea dependentelor frontend

Din folderul `frontend`:

```powershell
npm.cmd install
```

Daca politica PowerShell blocheaza `npm`, se foloseste `npm.cmd`.

### Pornirea frontend-ului

Din folderul `frontend`:

```powershell
npm.cmd run dev
```

Frontend-ul se acceseaza in browser la:

```text
http://localhost:3000
```

### Porniri ulterioare

Dupa configurarea initiala, aplicatia se porneste astfel:

Terminal 1, backend:

```powershell
cd "cale-catre-proiect\backend"
dotnet run --project src\Wms.Api
```

Terminal 2, frontend:

```powershell
cd "cale-catre-proiect\frontend"
npm.cmd run dev
```

Apoi se acceseaza:

```text
http://localhost:3000
```

## Probleme posibile si rezolvari

### Docker Desktop nu este pornit

Eroare posibila:

```text
failed to connect to the docker API at npipe:////./pipe/docker_engine
```

Rezolvare:

1. Se porneste Docker Desktop din Start Menu.
2. Se asteapta pana cand Docker este complet pornit.
3. Se verifica:

```powershell
docker info
```

Apoi se ruleaza din nou comanda Docker Compose.

### Virtualization support not detected

Eroare posibila:

```text
Docker Desktop failed to start because virtualisation support wasn't detected.
```

Se verifica in Task Manager:

```text
Performance -> CPU -> Virtualization
```

Daca virtualizarea este dezactivata, trebuie activata din BIOS/UEFI.

Daca virtualizarea este activata, dar Docker tot nu porneste, se ruleaza in PowerShell ca Administrator:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
bcdedit /set hypervisorlaunchtype auto
```

Apoi se reporneste calculatorul.

Dupa restart:

```powershell
wsl --update
wsl --set-default-version 2
wsl --status
```

### Eroare la build frontend: folderul public lipseste

Eroare posibila:

```text
COPY --from=build /app/public ./public
"/app/public": not found
```

Rezolvare:

```powershell
New-Item -ItemType Directory -Force frontend\public
New-Item -ItemType File -Force frontend\public\.gitkeep
```

Apoi se ruleaza din nou:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml up --build
```

### Portul PostgreSQL 5432 este blocat

Eroare posibila:

```text
ports are not available: exposing port TCP 0.0.0.0:5432
```

Rezolvare: in `infra/docker/.env.example`, se schimba portul extern PostgreSQL:

```env
POSTGRES_PORT=15432
```

Backend-ul comunica in continuare cu PostgreSQL intern prin:

```text
Host=postgres;Port=5432
```

Portul `15432` este folosit doar pentru accesarea bazei din Windows.

### Containerele nu apar in docker ps

Daca `docker ps` nu afiseaza containere, inseamna ca aplicatia nu ruleaza sau containerele s-au oprit.

Verificare:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml ps -a
```

Loguri generale:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml logs
```

Loguri pe servicii:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml logs backend --tail 100
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml logs frontend --tail 100
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml logs postgres --tail 100
```

### Frontend-ul porneste, dar login-ul afiseaza eroarea de autentificare

Eroare posibila in interfata:

```text
Unable to reach the authentication service.
```

Pentru rularea cu Docker, se verifica daca backend-ul ruleaza:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml ps
Test-NetConnection localhost -Port 8080
```

Daca backend-ul ruleaza, se verifica URL-ul API din `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://backend:8080
```

Daca s-a modificat aceasta valoare, se reconstruieste frontend-ul fara cache:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml build --no-cache frontend
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml up
```

Pentru rularea locala fara Docker, se verifica fisierul `frontend\.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
```

### Curatare generala Docker

Daca apar erori dupa mai multe incercari, se poate opri si curata rularea curenta:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml down --remove-orphans
```

Pentru resetare completa, inclusiv baza de date:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml down -v
```

Apoi:

```powershell
docker compose --env-file infra/docker/.env.example -f infra/docker/compose.yml up --build
```

## Date de logare

| Rol | Nume utilizator | Parola |
| --- | --- | --- |
| Admin | `admin.demo` | `Admin123!` |
| Sales | `sales.demo` | `Sales123!` |
| Warehouse | `warehouse.demo` | `Warehouse123!` |

## Observatii privind configurarea

Valorile din fisierele de configurare sunt utilizate doar pentru demonstrarea si testarea aplicatiei in contextul lucrarii de licenta.

Pentru un mediu real, parolele, cheile JWT si connection string-urile trebuie schimbate si gestionate prin variabile de mediu sau printr-un mecanism dedicat de secret management.

## Autor

**Nicolae-Petrisor Novacescu**  
Informatica ID, Universitatea Politehnica Timisoara  
Lucrare de licenta, sesiunea iunie - iulie 2026
