using Microsoft.AspNetCore.Mvc;

namespace AzkarApp.API.Controllers
{
    public class MessageController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
