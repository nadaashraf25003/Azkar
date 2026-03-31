using AzkarApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AzkarApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DhikrController : ControllerBase
    {
        private readonly DhikrService _service;

        public DhikrController(DhikrService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string category)
        {
            return Ok(await _service.GetByCategory(category));
        }
    }
}
