using AzkarApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AzkarApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AyahController : ControllerBase
    {
        private readonly AyahService _service;

        public AyahController(AyahService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAll());
        }
    }
}
