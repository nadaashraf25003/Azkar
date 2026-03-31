using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Domain.Entities
{
    public class Ayah
    {
        public string? Id { get; set; }
        public string? Surah { get; set; }
        public string? SurahEn { get; set; }
        public int? AyahNumber { get; set; }
        public string? TextAr { get; set; }
        public string? TextEn { get; set; }
        public string? AudioUrl { get; set; }
        public string? Reciter { get; set; }
        public string? TafsirAr { get; set; }
        public string? TafsirEn { get; set; }
    }
}
