using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MVPStudioReactOnboarding.Models;

public partial class Customer
{
    public int Id { get; set; }
    [DisplayName("Customer Name")]
    [Required(ErrorMessage = "Customer Name is required")]
    public string? Name { get; set; }
    [DisplayName("Customer Address")]
    [Required(ErrorMessage = "Customer Address is required")]
    public string? Address { get; set; }

    public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
