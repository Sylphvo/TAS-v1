using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberOrderPondConfiguration : IEntityTypeConfiguration<RubberOrderPondDb>
    {
        public void Configure(EntityTypeBuilder<RubberOrderPondDb> e)
        {
            e.ToTable("RubberOrderPond");

            // model không có [Key] => bắt buộc set composite key
            e.HasKey(x => new { x.OrderId, x.PondId });

            e.Property(x => x.AllocatedKg)
                .HasColumnType("decimal(12,3)")
                .HasDefaultValue(0m);

            e.Property(x => x.BatchNo).HasMaxLength(60);

            e.HasIndex(x => x.PondId);
            e.HasIndex(x => x.OrderId);
        }
    }
}
