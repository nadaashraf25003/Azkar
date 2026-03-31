using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Domain.Entities
{
    public class Question
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? AuthorName { get; set; }
        public int? Votes { get; set; }
        public bool IsLocked { get; set; }
        public bool IsVisible { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<Answer>? Answers { get; set; }
    }
}
