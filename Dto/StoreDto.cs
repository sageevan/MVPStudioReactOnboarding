using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
namespace MVPStudioReactOnboarding.Dto
{
    public class StoreDto
    {

        public int Id { get; set; }

        public string? Name { get; set; }

        public string? Address { get; set; }
    }
}
