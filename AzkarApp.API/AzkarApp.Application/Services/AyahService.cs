using AzkarApp.Application.Interfaces;
using AzkarApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace AzkarApp.Application.Services
{
    public class AyahService
    {
        private readonly IGenericRepository<Ayah> _repo;

        public AyahService(IGenericRepository<Ayah> repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Ayah>> GetAll()
            => await _repo.GetAllAsync();
    }
}
