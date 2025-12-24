using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberPondConfiguration : IEntityTypeConfiguration<RubberPondDb>
    {
        public void Configure(EntityTypeBuilder<RubberPondDb> e)
        {
            e.ToTable("RubberPond");
            e.HasKey(x => x.PondId);

            e.Property(x => x.PondCode).HasMaxLength(50);
            e.Property(x => x.AgentCode).HasMaxLength(50);
            e.Property(x => x.PondName).HasMaxLength(120);
            e.Property(x => x.Location).HasMaxLength(200);

            e.Property(x => x.CapacityKg).HasColumnType("decimal(12,3)");
            e.Property(x => x.CurrentNetKg).HasColumnType("decimal(12,3)");

            e.Property(x => x.Note).HasMaxLength(500);

            e.Property(x => x.Status).HasDefaultValue(1);

            e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
            e.Property(x => x.RegisterPerson).HasMaxLength(50);
            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.HasIndex(x => x.PondCode);
            e.HasIndex(x => x.AgentCode);
            e.HasIndex(x => x.Status);
        }
    }
}
