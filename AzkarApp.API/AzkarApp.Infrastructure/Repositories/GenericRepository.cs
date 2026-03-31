using AzkarApp.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace AzkarApp.Infrastructure.Repositories
{
    //public class GenericRepository<T> : IGenericRepository<T> where T : class
    //{
    //    private readonly AppDbContext _context;

    //    public GenericRepository(AppDbContext context)
    //    {
    //        _context = context;
    //    }

    //    public async Task<IEnumerable<T>> GetAllAsync()
    //        => await _context.Set<T>().ToListAsync();

    //    public async Task<T> GetByIdAsync(string id)
    //        => await _context.Set<T>().FindAsync(id);

    //    public async Task AddAsync(T entity)
    //    {
    //        await _context.Set<T>().AddAsync(entity);
    //        await _context.SaveChangesAsync();
    //    }
    //}
}
