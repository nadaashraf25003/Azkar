using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Domain.Entities
{
    public class Answer
    {
        public string? Id { get; set; }
        public string? Text { get; set; }
        public string? AuthorName { get; set; }
        public string? AuthorRole { get; set; }
        public int Votes { get; set; }
        public bool IsBest { get; set; }
        public DateTime? CreatedAt { get; set; }

        public string? QuestionId { get; set; }
        public Question? Question { get; set; }
    }
}
