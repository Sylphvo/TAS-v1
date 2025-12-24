using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberIntakeConfiguration : IEntityTypeConfiguration<RubberIntakeDb>
    {
        public void Configure(EntityTypeBuilder<RubberIntakeDb> e)
        {
            e.ToTable("RubberIntake");
            e.HasKey(x => x.IntakeId);

            // model có [Required] nhưng property là string? -> config theo Required
            e.Property(x => x.FarmCode).HasMaxLength(200).IsRequired();
            e.Property(x => x.FarmerName).HasMaxLength(200).IsRequired();

            e.Property(x => x.OrderCode).HasMaxLength(50);

            e.Property(x => x.RubberKg).HasColumnType("decimal(12,3)");
            e.Property(x => x.TSCPercent).HasColumnType("decimal(5,2)");
            e.Property(x => x.DRCPercent).HasColumnType("decimal(5,2)");
            e.Property(x => x.FinishedProductKg).HasColumnType("decimal(12,3)");
            e.Property(x => x.CentrifugeProductKg).HasColumnType("decimal(12,3)");

            e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
            e.Property(x => x.RegisterPerson).HasMaxLength(50);
            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.HasIndex(x => x.FarmCode);
            e.HasIndex(x => x.OrderCode);
        }
    }
}
