using System.Reflection;
using System.Text.Json;
using Adhkar.Domain.Entities;
using Content.Domain.Entities;
using Kids.Domain.Entities;
using Questions.Domain.Entities;
using Recitations.Domain.Entities;
using Tasbeeh.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BuildingBlocks.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AzkarDbContext dbContext)
    {
        try
        {
            Console.WriteLine("Starting database migration and seeding verification...");

            // 1. Seed Categories & Adhkar
            if (!await dbContext.ZikrCategories.AnyAsync())
            {
                Console.WriteLine("Seeding Zikr categories and Adhkar...");
                var morning = ZikrCategory.Create("morning", "أذكار الصباح", "sun", "Morning Azkar", 1);
                var evening = ZikrCategory.Create("evening", "أذكار المساء", "moon", "Evening Azkar", 2);
                var sleep = ZikrCategory.Create("sleep", "أذكار النوم", "bed", "Sleep Azkar", 3);
                var afterPrayer = ZikrCategory.Create("afterPrayer", "بعد الصلاة", "mosque", "After Prayer Azkar", 4);
                var general = ZikrCategory.Create("general", "أذكار عامة", "star", "General Azkar", 5);

                var categories = new Dictionary<string, ZikrCategory>
                {
                    { "morning", morning },
                    { "evening", evening },
                    { "sleep", sleep },
                    { "afterPrayer", afterPrayer },
                    { "general", general }
                };

                await dbContext.ZikrCategories.AddRangeAsync(categories.Values);
                await dbContext.SaveChangesAsync();

                // Load and seed Adhkar
                var json = await ReadEmbeddedJsonAsync("azkar.json");
                if (json != null)
                {
                    var localItems = JsonSerializer.Deserialize<List<LocalZikrItem>>(json);
                    if (localItems != null)
                    {
                        var order = 0;
                        foreach (var item in localItems)
                        {
                            if (categories.TryGetValue(item.category, out var cat))
                            {
                                var zikr = Zikr.Create(
                                    cat.Id,
                                    item.text,
                                    item.textEn,
                                    item.title ?? "",
                                    item.count,
                                    item.benefit,
                                    item.reference,
                                    order: order++
                                );
                                await dbContext.Adhkar.AddAsync(zikr);
                            }
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 2. Seed DailyMessages
            if (!await dbContext.DailyMessages.AnyAsync())
            {
                Console.WriteLine("Seeding Daily Messages...");
                var json = await ReadEmbeddedJsonAsync("messages.json");
                if (json != null)
                {
                    var localMsgs = JsonSerializer.Deserialize<List<LocalMessageItem>>(json);
                    if (localMsgs != null)
                    {
                        foreach (var item in localMsgs)
                        {
                            var dateFor = DateTime.TryParse(item.createdAt, out var dt) ? dt : DateTime.UtcNow;
                            var msg = DailyMessage.Create(item.textAr, item.type, item.authorAr, dateFor);
                            await dbContext.DailyMessages.AddAsync(msg);
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 3. Seed AsmaaAllah
            if (!await dbContext.AsmaaAllah.AnyAsync())
            {
                Console.WriteLine("Seeding Asmaa Allah...");
                var json = await ReadEmbeddedJsonAsync("asmaa-allah.json");
                if (json != null)
                {
                    var items = JsonSerializer.Deserialize<List<LocalAsmaaAllahItem>>(json);
                    if (items != null)
                    {
                        foreach (var item in items)
                        {
                            var asmaa = AsmaaAllah.Create(item.id, item.nameAr, item.transliteration, item.transliteration, item.meaningAr, item.meaningEn, "", "");
                            await dbContext.AsmaaAllah.AddAsync(asmaa);
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 4. Seed Questions
            if (!await dbContext.Questions.AnyAsync())
            {
                Console.WriteLine("Seeding Questions and Answers...");
                var json = await ReadEmbeddedJsonAsync("questions.json");
                if (json != null)
                {
                    var items = JsonSerializer.Deserialize<List<LocalQuestionItem>>(json);
                    if (items != null)
                    {
                        foreach (var item in items)
                        {
                            var category = item.tags != null && item.tags.Count > 0 ? item.tags[0] : "General";
                            var question = Question.Create(item.title, item.body, category, item.authorName, isApproved: true);
                            await dbContext.Questions.AddAsync(question);
                            await dbContext.SaveChangesAsync();

                            if (item.answers != null)
                            {
                                foreach (var ans in item.answers)
                                {
                                    var answer = Answer.Create(question.Id, ans.authorName, ans.text, "", ans.authorRole == "admin");
                                    await dbContext.Answers.AddAsync(answer);
                                }
                                await dbContext.SaveChangesAsync();
                            }
                        }
                    }
                }
            }

            // 6. Seed ReligiousInfo
            if (!await dbContext.ReligiousInfos.AnyAsync())
            {
                Console.WriteLine("Seeding Religious Info...");
                var json = await ReadEmbeddedJsonAsync("religious-info.json");
                if (json != null)
                {
                    var items = JsonSerializer.Deserialize<List<LocalReligiousInfoItem>>(json);
                    if (items != null)
                    {
                        foreach (var item in items)
                        {
                            var info = ReligiousInfo.Create(item.titleAr, item.category, item.contentAr, item.sourceAr);
                            await dbContext.ReligiousInfos.AddAsync(info);
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 7. Seed Seerah
            if (!await dbContext.SeerahEvents.AnyAsync())
            {
                Console.WriteLine("Seeding Seerah Events...");
                var json = await ReadEmbeddedJsonAsync("seerah.json");
                if (json != null)
                {
                    var items = JsonSerializer.Deserialize<List<LocalSeerahItem>>(json);
                    if (items != null)
                    {
                        var order = 0;
                        foreach (var item in items)
                        {
                            var lessons = string.Join("; ", item.lessonsAr ?? []);
                            var seerah = SeerahEvent.Create(order++, item.titleAr, "Makkah", 0, item.summaryAr, lessons);
                            await dbContext.SeerahEvents.AddAsync(seerah);
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 8. Seed Kids content
            if (!await dbContext.KidsStories.AnyAsync())
            {
                Console.WriteLine("Seeding Kids stories, challenges, and quizzes...");
                var json = await ReadEmbeddedJsonAsync("kids-content.json");
                if (json != null)
                {
                    var content = JsonSerializer.Deserialize<LocalKidsContent>(json);
                    if (content != null)
                    {
                        if (content.stories != null)
                        {
                            foreach (var s in content.stories)
                            {
                                var story = KidsStory.Create(s.titleAr, "5-8", s.summaryAr, s.moralAr);
                                await dbContext.KidsStories.AddAsync(story);
                            }
                        }

                        if (content.weeklyChallenges != null)
                        {
                            foreach (var c in content.weeklyChallenges)
                            {
                                var challenge = KidsChallenge.Create(c.titleAr, c.descriptionAr, 10, "Akhlaq");
                                await dbContext.KidsChallenges.AddAsync(challenge);
                            }
                        }

                        if (content.quiz != null)
                        {
                            foreach (var q in content.quiz)
                            {
                                var optionA = q.optionsAr != null && q.optionsAr.Count > 0 ? q.optionsAr[0] : "";
                                var optionB = q.optionsAr != null && q.optionsAr.Count > 1 ? q.optionsAr[1] : "";
                                var optionC = q.optionsAr != null && q.optionsAr.Count > 2 ? q.optionsAr[2] : "";
                                var optionD = q.optionsAr != null && q.optionsAr.Count > 3 ? q.optionsAr[3] : "";

                                var question = KidsQuizQuestion.Create(q.questionAr, optionA, optionB, optionC, optionD, q.correctIndex, "");
                                await dbContext.KidsQuizQuestions.AddAsync(question);
                            }
                        }

                        await dbContext.SaveChangesAsync();
                    }
                }
            }

            // 9. Seed Tasbeeh presets
            if (!await dbContext.TasbeehPresets.AnyAsync())
            {
                Console.WriteLine("Seeding Tasbeeh presets...");
                var defaultPresets = new List<TasbeehPreset>
                {
                    TasbeehPreset.Create("SubhanAllah", "سبحان الله", "SubhanAllah", "Glorifying Allah", 33),
                    TasbeehPreset.Create("Alhamdulillah", "الحمد لله", "Alhamdulillah", "Praising Allah", 33),
                    TasbeehPreset.Create("AllahuAkbar", "الله أكبر", "Allahu Akbar", "Magnifying Allah", 33),
                    TasbeehPreset.Create("LaIlahaIllallah", "لا إله إلا الله", "La ilaha illallah", "Declaring Oneness of Allah", 33),
                    TasbeehPreset.Create("Astaghfirullah", "أستغفر الله", "Astaghfirullah", "Seeking Forgiveness", 100),
                    TasbeehPreset.Create("SubhanAllahWabihamdihi", "سبحان الله وبحمده", "SubhanAllah wa bihamdihi", "Praising and Glorifying Allah", 100),
                    TasbeehPreset.Create("Salawat", "اللهم صل على محمد وآل محمد", "Allahumma salli ala Muhammad", "Blessings on the Prophet", 100)
                };

                await dbContext.TasbeehPresets.AddRangeAsync(defaultPresets);
                await dbContext.SaveChangesAsync();
            }

            // 10. Seed Recitations
            if (!await dbContext.Recitations.AnyAsync())
            {
                Console.WriteLine("Seeding Community Quran Recitations...");
                var rec1 = Recitation.Create(
                    "تلاوة خاشعة لسورة الفاتحة",
                    "أحمد القحطاني",
                    "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3",
                    1,
                    1,
                    7,
                    45
                );
                rec1.Approve();
                rec1.AddRating(5);
                rec1.AddRating(5);

                var rec2 = Recitation.Create(
                    "تلاوة مرتلة لآية الكرسي",
                    "سلمان العتيبي",
                    "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/002.mp3",
                    2,
                    255,
                    255,
                    60
                );
                rec2.Approve();
                rec2.AddRating(5);
                rec2.AddRating(4);

                var rec3 = Recitation.Create(
                    "سورة الإخلاص والمعوذتين",
                    "عبدالرحمن الشمري",
                    "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/112.mp3",
                    112,
                    1,
                    4,
                    30
                );
                rec3.Approve();
                rec3.AddRating(5);

                await dbContext.Recitations.AddRangeAsync(rec1, rec2, rec3);
                await dbContext.SaveChangesAsync();

                var comment1 = RecitationComment.Create(rec1.Id, "محمد السعيد", "ما شاء الله تبارك الله، تلاوة عطرة وأداء متقن");
                var comment2 = RecitationComment.Create(rec2.Id, "خالد إبراهيم", "جزاك الله خيراً، نبرة خاشعة ومؤثرة جداً");
                await dbContext.RecitationComments.AddRangeAsync(comment1, comment2);
                await dbContext.SaveChangesAsync();
            }

            Console.WriteLine("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error occurred during database seeding: {ex.Message}");
        }
    }

    private static async Task<string?> ReadEmbeddedJsonAsync(string fileName)
    {
        var assembly = typeof(DbSeeder).Assembly;
        var resourceName = $"BuildingBlocks.Infrastructure.Persistence.SeedData.{fileName}";
        
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            var resources = assembly.GetManifestResourceNames();
            var match = resources.FirstOrDefault(r => r.EndsWith(fileName, StringComparison.OrdinalIgnoreCase));
            if (match == null)
            {
                Console.WriteLine($"Could not find embedded resource: {fileName}");
                return null;
            }
            using var streamRetry = assembly.GetManifestResourceStream(match);
            if (streamRetry == null) return null;
            using var readerRetry = new StreamReader(streamRetry);
            return await readerRetry.ReadToEndAsync();
        }

        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync();
    }
}

// Local JSON DTOs for Deserialization
public class LocalZikrItem
{
    public string id { get; set; } = "";
    public string category { get; set; } = "";
    public string text { get; set; } = "";
    public string textEn { get; set; } = "";
    public int count { get; set; }
    public string reference { get; set; } = "";
    public string benefit { get; set; } = "";
    public string title { get; set; } = "";
}

public class LocalMessageItem
{
    public string id { get; set; } = "";
    public string type { get; set; } = "";
    public string titleAr { get; set; } = "";
    public string titleEn { get; set; } = "";
    public string textAr { get; set; } = "";
    public string textEn { get; set; } = "";
    public string authorAr { get; set; } = "";
    public string authorEn { get; set; } = "";
    public string createdAt { get; set; } = "";
}

public class LocalAsmaaAllahItem
{
    public int id { get; set; }
    public string nameAr { get; set; } = "";
    public string transliteration { get; set; } = "";
    public string meaningAr { get; set; } = "";
    public string meaningEn { get; set; } = "";
}



public class LocalQuestionItem
{
    public string id { get; set; } = "";
    public string title { get; set; } = "";
    public string body { get; set; } = "";
    public string authorName { get; set; } = "";
    public List<string>? tags { get; set; } = [];
    public List<LocalAnswerItem>? answers { get; set; } = [];
}

public class LocalAnswerItem
{
    public string id { get; set; } = "";
    public string text { get; set; } = "";
    public string authorName { get; set; } = "";
    public string authorRole { get; set; } = "";
}

public class LocalReligiousInfoItem
{
    public string id { get; set; } = "";
    public string titleAr { get; set; } = "";
    public string contentAr { get; set; } = "";
    public string sourceAr { get; set; } = "";
    public string category { get; set; } = "";
}

public class LocalSeerahItem
{
    public string id { get; set; } = "";
    public string titleAr { get; set; } = "";
    public string summaryAr { get; set; } = "";
    public List<string>? lessonsAr { get; set; } = [];
}

public class LocalKidsContent
{
    public List<LocalKidsStory>? stories { get; set; }
    public List<LocalKidsChallenge>? weeklyChallenges { get; set; }
    public List<LocalKidsQuiz>? quiz { get; set; }
}

public class LocalKidsStory
{
    public string id { get; set; } = "";
    public string titleAr { get; set; } = "";
    public string summaryAr { get; set; } = "";
    public string moralAr { get; set; } = "";
}

public class LocalKidsChallenge
{
    public string id { get; set; } = "";
    public string titleAr { get; set; } = "";
    public string descriptionAr { get; set; } = "";
}

public class LocalKidsQuiz
{
    public string id { get; set; } = "";
    public string questionAr { get; set; } = "";
    public List<string>? optionsAr { get; set; }
    public int correctIndex { get; set; }
}
