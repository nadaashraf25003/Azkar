# 📖 خادم ومنصة أذكار المسلم | Azkar Backend API

> **واجهة برمجة تطبيقات ويب حديثة فائقة الأداء والموثوقية** مبنية على بيئة **.NET 10** بنمط المعمارية النظيفة المعيارية (**Modular Clean Architecture**) مع **CQRS** و **MediatR** و **Entity Framework Core** و **SQL Server**.

---

## 📑 جدول المحتويات | Table of Contents
1. [🌟 نظرة عامة والمعمارية البرمجية (Architecture Overview)](#-نظرة-عامة-والمعمارية-البرمجية-architecture-overview)
2. [🏗️ مخطط سريان الطلبات (Clean Request Flow)](#️-مخطط-سريان-الطلبات-clean-request-flow)
3. [📦 الوحدات البرمجية والخدمات (Modules Breakdown)](#-الوحدات-البرمجية-والخدمات-modules-breakdown)
   - [وحدة الأذكار اليومية (Adhkar Module)](#1-وحدة-الأذكار-اليومية-adhkar-module)
   - [وحدة عداد التسبيح (Tasbeeh Module)](#2-وحدة-عداد-التسبيح-tasbeeh-module)
   - [وحدة منصة الأطفال (Kids Module)](#3-وحدة-منصة-الأطفال-kids-module)
   - [وحدة المحتوى الإسلامي والرسائل (Content Module)](#4-وحدة-المحتوى-الإسلامي-والرسائل-content-module)
   - [وحدة الأسئلة والأجوبة الفقهية (Questions Module)](#5-وحدة-الأسئلة-والأجوبة-الفقهية-questions-module)
   - [وحدة التلاوات القرآنية المجتمعية (Recitations Module)](#6-وحدة-التلاوات-القرآنية-المجتمعية-recitations-module)
   - [وحدة الإشراف وتقارير الأجهزة (Administration Module)](#7-وحدة-الإشراف-وتقارير-الأجهزة-administration-module)
4. [📂 هيكل المجلدات والملفات بالكامل (Complete File Structure)](#-هيكل-المجلدات-والملفات-بالكامل-complete-file-structure)
5. [🔌 دليل جميع نقاط النهاية للـ API (Complete API Endpoints Reference)](#-دليل-جميع-نقاط-النهاية-للـ-api-complete-api-endpoints-reference)
6. [🗄️ تصميم قاعدة البيانات والجداول (Database Schema & Tables)](#️-تصميم-قاعدة-البيانات-والجداول-database-schema--tables)
7. [⚙️ التقنيات والمكتبات المستخدمة (Tech Stack)](#️-التقنيات-والمكتبات-المستخدمة-tech-stack)
8. [🚀 التشغيل والبناء المحلي (Getting Started & Running Locally)](#-التشغيل-والبناء-المحلي-getting-started--running-locally)

---

## 🌟 نظرة عامة والمعمارية البرمجية (Architecture Overview)

تم تصميم النظام البرمجي للخادم وفق مبادئ **Modular Clean Architecture** لضمان:
- **الفصل التام للمسؤوليات (Separation of Concerns)**: كل وحدة (Module) مستقلة بذاتها وتتكون من 3 طبقات: `Domain` و `Application` و `Infrastructure`.
- **نمط CQRS**: فصل مسار القراءة (Queries) عن مسار الكتابة والتعديل والحذف (Commands) باستخدام **MediatR Pipeline**.
- **معالجة الأخطاء الوظيفية (Result Monad Pattern)**: عدم استخدام الاستثناءات (Exceptions) في منطق الأعمال واستبدالها بنموذج `Result<T>` و `Error`.
- **التدقيق التلقائي (Automatic Auditing)**: يتم تعبئة حقول `CreatedAtUtc` و `UpdatedAtUtc` تلقائياً عبر `AuditableEntityInterceptor`.
- **عزل المخططات (Database Schemas)**: كل وحدة لها Schema خاصة بها في قاعدة البيانات (مثل `adhkar`, `tasbeeh`, `kids`, `content`, `questions`, `recitations`, `admin`).

---

## 🏗️ مخطط سريان الطلبات (Clean Request Flow)

```text
               ┌────────────────────────────────────────────────────────┐
               │              HTTP Request (JSON Payload)               │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │    ASP.NET Core Minimal APIs & Route Groups (Endpoints)│
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │      MediatR Pipeline (ICommand<T> / IQuery<T>)        │
               │   • ValidationBehavior (FluentValidation)              │
               │   • Logging & Exception Handling Middlewares           │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │         Command / Query Handlers (Application)         │
               │   • Domain Business Invariants Validation              │
               │   • Factory Method Entity Creation                     │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │      Domain Entities & Rules (Domain Layer)            │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │   EF Core DbContext & Interceptors (Infrastructure)    │
               │   • AuditableEntityInterceptor (Auto Timestamps)       │
               │   • Explicit Schema Mapping per Module                 │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │            SQL Server Database (Production)            │
               └────────────────────────────────────────────────────────┘
```

---

## 📦 الوحدات البرمجية والخدمات (Modules Breakdown)

### 1. وحدة الأذكار اليومية (Adhkar Module)
- **الكيانات (Entities)**: `Zikr`, `Category`.
- **العمليات (Operations)**:
  - جلب قائمة جميع الأذكار (`GetAllAdhkarQuery`).
  - جلب تصنيفات الأذكار مع عدد عناصر كل فئة (`GetCategoriesQuery`).
  - جلب الأذكار حسب التصنيف (`GetAdhkarByCategoryQuery`).
  - إضافة ذكر جديد إلى الخادم من لوحة المشرف (`CreateZikrCommand`).
  - حذف ذكر نهائياً من قاعدة البيانات (`DeleteZikrCommand`).

### 2. وحدة عداد التسبيح (Tasbeeh Module)
- **الكيانات (Entities)**: `TasbeehPreset`.
- **العمليات (Operations)**:
  - جلب أذكار وتفضيلات التسبيح المحفوظة (`GetTasbeehPresetsQuery`).
  - إضافة تسبيحة/ذكر جديد بالهدف المخصص والفضل والترجمة (`CreateTasbeehPresetCommand`).
  - حذف ذكر من العداد للمشرف (`DeleteTasbeehPresetCommand`).

### 3. وحدة منصة الأطفال (Kids Module)
- **الكيانات (Entities)**: `KidsStory`, `KidsChallenge`, `KidsQuizQuestion`.
- **العمليات (Operations)**:
  - إدارة القصص الإسلامية للأطفال مصنفة حسب الفئات العمرية (`Create/Delete KidsStory`).
  - إدارة التحديات الدينية والسلوكية والنقاط (`Create/Delete KidsChallenge`).
  - إدارة أسئلة المسابقات التفاعلية والخيارات وشرح الإجابة الصحيحة (`Create/Delete KidsQuizQuestion`).

### 4. وحدة المحتوى الإسلامي والرسائل (Content Module)
- **الكيانات (Entities)**: `DailyMessage`, `SeerahEvent`, `ReligiousInfoItem`.
- **العمليات (Operations)**:
  - **الرسائل والخواطر**: جلب رسالة اليوم العشوائية، التصفية حسب التصنيف (10 تصنيفات)، والإضافة والحذف.
  - **السيرة النبوية**: جلب التسلسل الزمني للأحداث (العهد المكي والمدني)، والإضافة والحذف.
  - **المعلومات الدينية**: جلب البطاقات المعرفية الموثقة بالمصادر والتصنيفات، والإضافة والحذف.

### 5. وحدة الأسئلة والأجوبة الفقهية (Questions Module)
- **الكيانات (Entities)**: `Question`, `Answer`, `Vote`.
- **العمليات (Operations)**:
  - طرح سؤال من المستخدمين (`AskQuestionCommand`).
  - الإجابة على الأسئلة مع توثيق المصدر الفقهي (`AnswerQuestionCommand`).
  - التصويت على الأسئلة (`VoteQuestionCommand`).
  - اعتماد الأسئلة المعلقة (`ApproveQuestionCommand`) وحذف الأسئلة والأجوبة.

### 6. وحدة التلاوات القرآنية المجتمعية (Recitations Module)
- **الكيانات (Entities)**: `Recitation`, `RecitationComment`, `RecitationRating`.
- **العمليات (Operations)**:
  - رفع وتخزين ملفات التلاوات الصوتية (`SubmitRecitationCommand`).
  - دورة تدقيق واعتماد التلاوات (`Approve/Reject Recitation`).
  - تقييم التلاوات بالنجوم والتعليق عليها وحذف التعليقات المخالفة.

### 7. وحدة الإشراف وتقارير الأجهزة (Administration Module)
- **الكيانات (Entities)**: `ContentReport`, `AuditLog`.
- **العمليات (Operations)**:
  - تقارير وإحصائيات الأجهزة الفريدة الزائرة (`GetDeviceReportsQuery`).
  - ملخص وتوزيع الزيارات والأنظمة (`GetDeviceReportSummaryQuery`).
  - تسجيل نشاط ودخول الأجهزة تلقائياً (`LogDeviceActivityCommand`).
  - تنظيف السجلات القديمة الأقدم من 90 يوماً (`ClearOldAuditLogsCommand`).
  - استقبال وبلاغات المستخدمين عن المحتوى المخالف وحلها (`Report/Resolve Content`).

---

## 📂 هيكل المجلدات والملفات بالكامل (Complete File Structure)

```text
Azkar_Back/
├── Azkar.slnx                               # Solution file
├── publish/                                 # Build & deployment artifacts
│
└── src/
    ├── BuildingBlocks/                      # المشتركات الأساسية المعمارية
    │   ├── BuildingBlocks.Domain/           # الكيانات والقواعد المجردة الأساسية
    │   │   ├── Entity.cs                    # الكيان الأساسي مع معرف Guid والـ Domain Events
    │   │   ├── AuditableEntity.cs           # كيان يتضمن تاريخ الإنشاء والتعديل التلقائي
    │   │   ├── Result.cs                    # نموذج Result Monad للنتائج الناجحة والفاشلة
    │   │   ├── Error.cs                     # تصنيفات الأخطاء ونوع الخطأ
    │   │   └── IDomainEvent.cs              # واجهة أحداث النطاق (Domain Events)
    │   │
    │   ├── BuildingBlocks.Application/      # خطوط معالجة الـ CQRS والتحقق
    │   │   ├── CQRS/                        # ICommand, IQuery, ICommandHandler, IQueryHandler
    │   │   └── Behaviors/                   # خطافات MediatR للتحقق عبر FluentValidation
    │   │
    │   └── BuildingBlocks.Infrastructure/   # طبقة البيانات الموحدة
    │       ├── Persistence/
    │       │   ├── AzkarDbContext.cs        # سياق قاعدة البيانات الرئيسي وتكوين الـ Schemas
    │       │   ├── AzkarDbContextFactory.cs # مُنشئ السياق وقت التصميم لـ EF Core Migrations
    │       │   └── Migrations/              # سجل هجرات وتعديلات قاعدة البيانات
    │       └── Interceptors/
    │           └── AuditableEntityInterceptor.cs # معالج تحديث التواريخ التلقائية UTC
    │
    ├── Host/
    │   └── Azkar.Api/                       # تطبيق ومسارات الـ Web API
    │       ├── Endpoints/                   # جميع نقاط النهاية المجمعة (Minimal APIs)
    │       │   ├── AdhkarEndpoints.cs       # مسارات الأذكار اليومية
    │       │   ├── AdminEndpoints.cs        # مسارات المشرف وتقارير الأجهزة
    │       │   ├── ContentEndpoints.cs      # مسارات الرسائل والسيرة والمعلومات
    │       │   ├── KidsEndpoints.cs         # مسارات قصص وتحديات ومسابقات الأطفال
    │       │   ├── QuestionsEndpoints.cs    # مسارات الأسئلة والأجوبة الفقهية
    │       │   ├── RecitationsEndpoints.cs  # مسارات التلاوات المجتمعية والتعليقات
    │       │   └── TasbeehEndpoints.cs      # مسارات عداد التسبيح
    │       │
    │       ├── Middleware/                  # البرمجيات الوسيطة
    │       │   ├── ExceptionHandlingMiddleware.cs # المعالجة المركزية للأخطاء غير المتوقعة
    │       │   └── RequestLoggingMiddleware.cs    # تسجيل تفاصيل وزمن استجابة الطلبات
    │       │
    │       ├── Program.cs                   # إعداد حقن التبعيات (DI)، الـ CORS، و Swagger
    │       └── appsettings.json             # نصوص الاتصال بقاعدة البيانات والإعدادات
    │
    └── Modules/                             # الوحدات الوظيفية المستقلة
        ├── Adhkar/                          # وحدة الأذكار اليومية
        │   ├── Adhkar.Domain/               # Zikr, Category
        │   ├── Adhkar.Application/          # Commands, Queries, Handlers, DTOs
        │   └── Adhkar.Infrastructure/       # Context Interface & Repository mappings
        │
        ├── Administration/                  # وحدة إدارة النظام وتقارير الأجهزة
        │   ├── Administration.Domain/       # ContentReport, AuditLog
        │   ├── Administration.Application/  # Device Reports, Dashboard Stats, Handlers
        │   └── Administration.Infrastructure/
        │
        ├── Content/                         # وحدة المحتوى (الرسائل، السيرة، المعلومات)
        │   ├── Content.Domain/              # DailyMessage, SeerahEvent, ReligiousInfoItem
        │   ├── Content.Application/         # CQRS Commands & Handlers
        │   └── Content.Infrastructure/
        │
        ├── Kids/                            # وحدة منصة الأطفال
        │   ├── Kids.Domain/                 # KidsStory, KidsChallenge, KidsQuizQuestion
        │   ├── Kids.Application/            # CQRS Handlers & Validation
        │   └── Kids.Infrastructure/
        │
        ├── Questions/                       # وحدة الأسئلة والأجوبة
        │   ├── Questions.Domain/            # Question, Answer, Vote
        │   ├── Questions.Application/       # Q&A Commands & Moderation Handlers
        │   └── Questions.Infrastructure/
        │
        ├── Recitations/                     # وحدة التلاوات الصوتية
        │   ├── Recitations.Domain/          # Recitation, RecitationComment, RecitationRating
        │   ├── Recitations.Application/     # Audio Upload & Moderation Handlers
        │   └── Recitations.Infrastructure/
        │
        └── Tasbeeh/                         # وحدة عداد التسبيح
            ├── Tasbeeh.Domain/              # TasbeehPreset
            ├── Tasbeeh.Application/         # Preset Management Handlers
            └── Tasbeeh.Infrastructure/
```

---

## 🔌 دليل جميع نقاط النهاية للـ API (Complete API Endpoints Reference)

### 📿 1. الأذكار اليومية (Adhkar)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/adhkar` | جلب جميع الأذكار اليومية |
| `GET` | `/adhkar/categories` | جلب تصنيفات الأذكار مع إحصائيات العناصر |
| `GET` | `/adhkar/by-category/{categoryId}` | جلب أذكار تصنيف محدد |
| `GET` | `/adhkar/{id}` | جلب تفاصيل ذكر محدد |
| `POST` | `/adhkar` | إضافة ذكر جديد (Admin) |
| `DELETE` | `/adhkar/{id}` | حذف ذكر محدد من قاعدة البيانات (Admin) |
| `POST` | `/adhkar/device-open` | تسجيل نشاط فتح التطبيق للجهاز |

### 📿 2. عداد التسبيح (Tasbeeh)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasbeeh/presets` | جلب أذكار وتفضيلات العداد |
| `POST` | `/tasbeeh/presets` | إضافة ذكر للعداد بالهدف المخصص والفضل (Admin) |
| `DELETE` | `/tasbeeh/presets/{id}` | حذف ذكر من العداد (Admin) |

### 🎈 3. منصة الأطفال (Kids)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/kids/stories` | جلب جميع القصص الإسلامية للأطفال |
| `POST` | `/kids/stories` | إضافة قصة إسلامية جديدة للأطفال (Admin) |
| `DELETE` | `/kids/stories/{id}` | حذف قصة أطفال (Admin) |
| `GET` | `/kids/challenges` | جلب التحديات الدينية والسلوكية |
| `POST` | `/kids/challenges` | إضافة تحدي جديد للأطفال (Admin) |
| `DELETE` | `/kids/challenges/{id}` | حذف تحدي (Admin) |
| `GET` | `/kids/quizzes` | جلب أسئلة المسابقات التفاعلية للأطفال |
| `POST` | `/kids/quizzes` | إضافة سؤال مسابقة جديد (Admin) |
| `DELETE` | `/kids/quizzes/{id}` | حذف سؤال مسابقة (Admin) |

### 💌 4. المحتوى والرسائل والسيرة (Content)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/content/daily-message` | جلب رسالة اليوم العشوائية |
| `GET` | `/content/messages` | جلب جميع الرسائل والخواطر |
| `GET` | `/content/messages/category/{category}` | جلب رسائل تصنيف محدد |
| `POST` | `/content/messages` | إضافة رسالة جديدة للخادم (Admin) |
| `DELETE` | `/content/messages/{id}` | حذف رسالة من الخادم (Admin) |
| `GET` | `/content/seerah` | جلب أحداث ومحطات السيرة النبوية |
| `POST` | `/content/seerah` | إضافة حدث في السيرة النبوية (Admin) |
| `DELETE` | `/content/seerah/{id}` | حذف حدث من السيرة (Admin) |
| `GET` | `/content/religious-info` | جلب المقالات والمعلومات الدينية |
| `POST` | `/content/religious-info` | إضافة مقال ومعلومة دينية (Admin) |
| `DELETE` | `/content/religious-info/{id}` | حذف معلومة دينية (Admin) |

### ❓ 5. الأسئلة والأجوبة الفقهية (Questions)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/questions` | جلب الأسئلة المعتمدة |
| `GET` | `/questions/pending` | جلب الأسئلة المعلقة بانتظار الاعتماد (Admin) |
| `GET` | `/questions/{id}` | جلب تفاصيل سؤال مع إجاباته |
| `POST` | `/questions` | طرح سؤال جديد من المستخدم |
| `POST` | `/questions/{id}/answer` | إضافة إجابة موثقة بالمراجع على سؤال |
| `POST` | `/questions/{id}/vote` | التصويت على سؤال |
| `POST` | `/questions/{id}/approve` | اعتماد سؤال ونشره (Admin) |
| `DELETE` | `/questions/{id}` | حذف سؤال نهائياً (Admin) |
| `DELETE` | `/questions/answers/{answerId}` | حذف إجابة محددة (Admin) |

### 🎙️ 6. التلاوات القرآنية المجتمعية (Recitations)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recitations` | جلب التلاوات القرآنية المعتمدة |
| `GET` | `/recitations/pending` | جلب التلاوات المعلقة بانتظار الاعتماد (Admin) |
| `POST` | `/recitations` | رفع تلاوة صوتية جديدة |
| `POST` | `/recitations/{id}/approve` | اعتماد تلاوة ونشرها (Admin) |
| `POST` | `/recitations/{id}/reject` | رفض تلاوة مع بيان السبب (Admin) |
| `POST` | `/recitations/{id}/comments` | إضافة تعليق على تلاوة |
| `POST` | `/recitations/{id}/rate` | تقييم تلاوة بالنجوم (1 إلى 5) |
| `DELETE` | `/recitations/{id}` | حذف تلاوة (Admin) |
| `DELETE` | `/recitations/comments/{commentId}` | حذف تعليق مخالف (Admin) |

### 📊 7. الإشراف وتقارير الأجهزة (Administration)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/stats` | جلب إحصائيات عامة للنظام |
| `GET` | `/admin/devices` | جلب تقارير وسجلات الأجهزة التي دخلت التطبيق مع البحث |
| `GET` | `/admin/devices/summary` | ملخص إحصائي للأجهزة وتوزيع الأنظمة (OS) |
| `POST` | `/admin/devices/log` | تسجيل نشاط ودخول جهاز للتطبيق |
| `POST` | `/admin/devices/clear` | تنظيف وحذف سجلات الأجهزة الأقدم من عدد أيام محدد |
| `GET` | `/admin/reports` | جلب بلاغات المحتوى المعلقة |
| `POST` | `/admin/reports` | إرسال بلاغ عن محتوى مخالف |

---

## 🗄️ تصميم قاعدة البيانات والجداول (Database Schema & Tables)

| المخطط (Schema) | الجدول (Table) | الوصف (Description) |
|---|---|---|
| `adhkar` | `Categories` | تصنيفات الأذكار (الصباح، المساء، النوم، إلخ) |
| `adhkar` | `Adhkar` | نصوص الأذكار والترجمة والفضل وعدد التكرار |
| `tasbeeh` | `Presets` | أذكار العداد الإلكتروني والهدف المخصص |
| `kids` | `Stories` | قصص الأطفال الإسلامية والعبر المستفادة |
| `kids` | `Challenges` | التحديات اليومية والأسبوعية والنقاط للأطفال |
| `kids` | `QuizQuestions` | أسئلة مسابقات الأطفال والخيارات والشرح |
| `content` | `DailyMessages` | الرسائل والخواطر وتصنيفاتها |
| `content` | `SeerahEvents` | محطات وأحداث السيرة النبوية الشريفة |
| `content` | `ReligiousInfoItems` | البطاقات والمعلومات الدينية والمصادر |
| `questions` | `Questions` | أسئلة المستخدمين وحالة الاعتماد والتصويت |
| `questions` | `Answers` | إجابات الأسئلة والمراجع الفقهية |
| `questions` | `Votes` | سجل تصويت المستخدمين |
| `recitations` | `Recitations` | التلاوات القرآنية الصوتية وتفاصيل السور والآيات |
| `recitations` | `Comments` | تعليقات المستخدمين على التلاوات |
| `recitations` | `Ratings` | تقييمات التلاوات بالنجوم |
| `admin` | `ContentReports` | بلاغات المستخدمين وحالة حلها |
| `admin` | `AuditLogs` | سجلات الأجهزة، الزيارات، والتتبع التحليلي |

---

## ⚙️ التقنيات والمكتبات المستخدمة (Tech Stack)

- **Target Framework**: .NET 10 (C# 13)
- **Web API**: ASP.NET Core Minimal APIs & Route Groups
- **Mediator Pattern**: MediatR 12
- **Validation**: FluentValidation 11 with MediatR Pipeline Behavior
- **ORM & Database Provider**: Entity Framework Core 10 with Microsoft SQL Server
- **API Documentation**: Swagger / OpenAPI with Swashbuckle
- **Logging & Diagnostics**: Built-in ILogger with Structured Request Middleware

---

## 🚀 التشغيل والبناء المحلي (Getting Started & Running Locally)

### 1. المتطلبات الأساسية (Prerequisites)
- تثبيت **.NET 10 SDK**.
- خادم **SQL Server** محلي أو سحابي.

### 2. إعداد قاعدة البيانات (Database Configuration)
قم بتعديل نص الاتصال في `src/Host/Azkar.Api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=AzkarDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

### 3. بناء المشروع (Build Solution)
```bash
dotnet build Azkar.slnx
```

### 4. تطبيق هجرات قاعدة البيانات (Apply Migrations)
```bash
dotnet ef database update --project src/BuildingBlocks/BuildingBlocks.Infrastructure --startup-project src/Host/Azkar.Api
```

### 5. تشغيل خادم الـ API
```bash
dotnet run --project src/Host/Azkar.Api
```
- واجهة **Swagger UI** متاحة على: `http://localhost:5000` أو `https://localhost:5001`.

---

<div align="center">
  <sub>صُنع بكل حب وابتغاءً للأجر والثواب 🤍 • Azkar API Team</sub>
</div>
