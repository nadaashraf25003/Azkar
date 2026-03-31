using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Application.Interfaces
{
    public interface IGenericRepository<T>
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(string id);
        Task AddAsync(T entity);
    }
}
