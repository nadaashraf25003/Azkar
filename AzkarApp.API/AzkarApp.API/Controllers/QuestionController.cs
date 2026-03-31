using Microsoft.AspNetCore.Mvc;

namespace AzkarApp.API.Controllers
{
    public class QuestionController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
