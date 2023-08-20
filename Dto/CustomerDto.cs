using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace MVPStudioReactOnboarding.Dto
{
    public class CustomerDto
    {
        public int Id { get; set; }
        [DisplayName("Customer Name")]
        [Required(ErrorMessage = "Customer Name is required")]
        public string? Name { get; set; }
        [DisplayName("Customer Address")]
        [Required(ErrorMessage = "Customer Address is required")]
        public string? Address { get; set; }
    }
}
