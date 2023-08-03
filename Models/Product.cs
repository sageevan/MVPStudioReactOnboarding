using System;
using System.Collections.Generic;

namespace MVPStudioReactOnboarding.Models;

public partial class Product
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public decimal? Price { get; set; }

    public virtual Sale? Sale { get; set; }
}
