using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace MVPStudioReactOnboarding.Dto
{
    public class CustomerDto
    {
        public int Id { get; set; }
        [DisplayName("Employee Name")]
        [Required(ErrorMessage = "Employee Name is required")]
        public string? Name { get; set; }
        [DisplayName("Employee Name")]
        [Required(ErrorMessage = "Employee Name is required")]
        public string? Address { get; set; }
    }
}
