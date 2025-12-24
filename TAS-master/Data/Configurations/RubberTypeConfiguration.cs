using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberTypeConfiguration : IEntityTypeConfiguration<RubberType>
    {
        public void Configure(EntityTypeBuilder<RubberType> e)
        {
            e.ToTable("RubberType");
            e.HasKey(x => x.TypeId);

            e.Property(x => x.TypeCode).HasMaxLength(50);
            e.Property(x => x.TypeName).HasMaxLength(200);

            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.HasIndex(x => x.TypeCode);
        }
    }
}
