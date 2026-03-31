using Microsoft.AspNetCore.Mvc;

namespace AzkarApp.API.Controllers
{
    public class StoryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
