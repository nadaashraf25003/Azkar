# 📖 Azkar Backend - Modular Clean Architecture (.NET 10)

A modern and robust backend for the Azkar and Holy Quran application, built on the **Modular Clean Architecture** pattern using **CQRS**, **MediatR**, and **Entity Framework Core**.

---

## 🌟 Architecture Overview

The project follows a clean and strict request processing flow (Clean Architecture Request Flow):

```text
HTTP Request
     │
     ▼
API Endpoint (Minimal APIs / Route Groups)
     │
     ▼
Command / Query (ICommand<T> / IQuery<T>)
     │
     ▼
Handler (MediatR CQRS Pipeline)
     │
     ├── Validation (FluentValidation Auto-Validation)
     │
     ├── Business Rules (Result<T> & Error Monads)
     │
     ▼
Domain (Entities, Value Objects, Domain Events)
     │
     ▼
Repository / Infrastructure (EF Core AzkarDbContext & Interceptors)
     │
     ▼
Database (MonsterASP SQL Server - Schemas per Module)
```

---

## 📂 Project Structure

The project is divided into independent modules with shared layers (BuildingBlocks):

```text
Azkar_Back/
├── Azkar.slnx
│
├── src/
│   ├── Host/
│   │   └── Azkar.Api/                         # Entry point, Server startup and Swagger
│   │       ├── Endpoints/                     # API routes for all modules
│   │       ├── Middleware/                    # Error handling and logging
│   │       ├── Program.cs                     # Service configuration and app startup
│   │       └── appsettings.json               # Database connection strings
│   │
│   ├── BuildingBlocks/
│   │   ├── BuildingBlocks.Domain/             # Core entities (Entity, Result, Error, IDomainEvent)
│   │   ├── BuildingBlocks.Application/        # CQRS pattern and Validation Behaviors
│   │   └── BuildingBlocks.Infrastructure/     # General DB context and Design Factory (AzkarDbContext)
│   │
│   └── Modules/
│       ├── Adhkar/           (Adhkar.Domain, Adhkar.Application, Adhkar.Infrastructure)
│       ├── Quran/            (Quran.Domain, Quran.Application, Quran.Infrastructure)
│       ├── Recitations/      (Recitations.Domain, Recitations.Application, Recitations.Infrastructure)
│       ├── Tasbeeh/          (Tasbeeh.Domain, Tasbeeh.Application, Tasbeeh.Infrastructure)
│       ├── Questions/        (Questions.Domain, Questions.Application, Questions.Infrastructure)
│       ├── Content/          (Content.Domain, Content.Application, Content.Infrastructure)
│       ├── Kids/             (Kids.Domain, Kids.Application, Kids.Infrastructure)
│       ├── Prayer/           (Prayer.Domain, Prayer.Application, Prayer.Infrastructure)
│       ├── Favorites/        (Favorites.Domain, Favorites.Application, Favorites.Infrastructure)
│       ├── Notifications/    (Notifications.Domain, Notifications.Application, Notifications.Infrastructure)
│       └── Administration/   (Administration.Domain, Administration.Application, Administration.Infrastructure)
```

---

## 🗄️ Database Schemas

The database is connected to **MonsterASP SQL Server** with tables separated into logical schemas:

| Module | Schema | Tables |
| :--- | :--- | :--- |
| **Adhkar** | `adhkar` | `Categories`, `Adhkar`, `DailyProgress` |
| **Quran** | `quran` | `Surahs`, `Ayat`, `Tafsir`, `Reciters` |
| **Recitations** | `recitations` | `Recitations`, `RecitationComments`, `RecitationRatings` |
| **Tasbeeh** | `tasbeeh` | `TasbeehPresets`, `TasbeehSessions` |
| **Questions** | `questions` | `Questions`, `Answers`, `VoteRecords` |
| **Content** | `content` | `AsmaaAllah`, `SeerahEvents`, `ReligiousInfo`, `Messages` |
| **Kids** | `kids` | `Stories`, `Challenges`, `QuizQuestions`, `KidsProgress` |
| **Prayer** | `prayer` | `PrayerSettings` |
| **Favorites** | `favorites` | `Favorites` |
| **Notifications** | `notifications`| `PushSubscriptions` |
| **Administration** | `administration`| `ContentReports`, `AuditLogs` |

> 🔒 **Privacy Note**: The system does not store any login credentials or passwords. All interactive features (Favorites, Adhkar tracking, Kids points) work via an anonymous device ID (`DeviceIdentifier`).

---

## 🚀 How to Test & Run

### 1️⃣ Apply Database Migration on MonsterASP
To automatically apply tables and schemas on the MonsterASP server:

```bash
cd c:\Users\user\Desktop\Azkar_website\Azkar_Back
dotnet ef database update --project src/BuildingBlocks/BuildingBlocks.Infrastructure/BuildingBlocks.Infrastructure.csproj --startup-project src/Host/Azkar.Api/Azkar.Api.csproj
```

---

### 2️⃣ Run Locally

```bash
cd c:\Users\user\Desktop\Azkar_website\Azkar_Back\src\Host\Azkar.Api
dotnet run
```

Upon running, you will see a message showing the ports (e.g., `http://localhost:5000` or `https://localhost:5001` or `http://localhost:5242`).

---

### 3️⃣ Open Swagger UI and Test Endpoints

Open your browser to the main server URL:
```
http://localhost:5242/
```
(Or the URL displayed in the terminal)

The interactive **Swagger UI** will open, containing all organized endpoints:

#### Example API Endpoints:

* **Adhkar**:
  * `GET /api/adhkar/categories` - Get all Adhkar categories
  * `GET /api/adhkar/by-category/{categoryId}` - Get Adhkar of a specific category
  * `GET /api/adhkar/progress/today?deviceId=test-device-1` - Get today's progress
  * `POST /api/adhkar/progress` - Update Adhkar progress

* **Quran**:
  * `GET /api/quran/surahs` - Get list of 114 Surahs
  * `GET /api/quran/surahs/1/ayat` - Get Ayat of a specific Surah (Al-Fatiha)
  * `GET /api/quran/tafsir?surahNumber=1&ayahNumber=1` - Get Tafsir of an Ayah
  * `GET /api/quran/reciters` - Get list of Reciters

* **Electronic Rosary (Tasbeeh)**:
  * `GET /api/tasbeeh/presets` - Get ready-made Tasbeehs
  * `POST /api/tasbeeh/session` - Log a new Tasbeeh session
  * `GET /api/tasbeeh/stats?deviceId=test-device-1` - Tasbeeh statistics

* **Islamic Q&A (Questions)**:
  * `GET /api/questions` - Get questions
  * `POST /api/questions` - Ask a new question
  * `POST /api/questions/answers` - Add an answer

* **Islamic Content (Content)**:
  * `GET /api/content/asmaa-allah` - 99 Names of Allah and their meanings
  * `GET /api/content/seerah` - Events of the Prophet's Biography (Seerah)
  * `GET /api/content/daily-message` - Daily message

* **Kids Corner (Kids)**:
  * `GET /api/kids/stories` - Kids' stories
  * `GET /api/kids/challenges` - Daily challenges
  * `GET /api/kids/quizzes` - Quiz questions
  * `POST /api/kids/points` - Add points and achievements

* **Prayer Times and Qibla (Prayer)**:
  * `GET /api/prayer/times?lat=30.0444&lng=31.2357` - Calculate prayer times
  * `GET /api/prayer/qibla?lat=30.0444&lng=31.2357` - Qibla direction and distance to Kaaba

* **Favorites (Favorites)**:
  * `GET /api/favorites?deviceId=test-device-1` - Get favorite items
  * `POST /api/favorites/toggle` - Add/remove from favorites

---

### 4️⃣ Build Verification
To ensure the entire project code is sound:
```bash
cd c:\Users\user\Desktop\Azkar_website\Azkar_Back
dotnet build
```
Result: `Build succeeded. 0 Warning(s), 0 Error(s)`.
