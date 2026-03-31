using AzkarApp.Domain.Entities;
using AzkarApp.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace AzkarApp.Application.Services
{
    public class DhikrService
    {
        private readonly AppDbContext _context;

        public DhikrService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Dhikr>> GetByCategory(string category)
        {
            return await _context.Dhikrs
                .Where(d => d.Category == category)
                .ToListAsync();
        }
    }
}
