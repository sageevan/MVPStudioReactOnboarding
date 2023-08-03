using System;
using System.Collections.Generic;

namespace MVPStudioReactOnboarding.Models;

public partial class Customer
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Address { get; set; }

    public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
