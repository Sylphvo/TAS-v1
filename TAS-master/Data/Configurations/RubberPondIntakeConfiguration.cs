using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberPondIntakeConfiguration : IEntityTypeConfiguration<RubberPondIntakeDb>
    {
        public void Configure(EntityTypeBuilder<RubberPondIntakeDb> e)
        {
            e.ToTable("RubberPondIntake");

            e.HasKey(x => new { x.PondId, x.IntakeId });

            e.Property(x => x.PouredKg)
                .HasColumnType("decimal(12,3)")
                .HasDefaultValue(0m);

            e.Property(x => x.PouredAt)
                .HasDefaultValueSql("GETDATE()");

            e.HasIndex(x => x.IntakeId);
            e.HasIndex(x => x.PondId);
        }
    }
}
