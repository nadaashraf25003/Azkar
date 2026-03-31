using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Domain.Entities
{
    public class Dhikr
    {
        public string? Id { get; set; }
        public string? Category { get; set; }
        public string? Text { get; set; }
        public string? TextEn { get; set; }
        public int? Count { get; set; }
        public string? Reference { get; set; }
        public string? Benefit { get; set; }
    }


}
