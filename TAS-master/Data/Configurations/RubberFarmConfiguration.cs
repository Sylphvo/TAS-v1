using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberFarmConfiguration : IEntityTypeConfiguration<RubberFarmDb>
    {
        public void Configure(EntityTypeBuilder<RubberFarmDb> e)
        {
            e.ToTable("RubberFarm");
            e.HasKey(x => x.FarmId);

            e.Property(x => x.FarmCode).HasMaxLength(50);
            e.Property(x => x.AgentCode).HasMaxLength(50);

            e.Property(x => x.FarmerName).HasMaxLength(200);
            e.Property(x => x.FarmPhone).HasMaxLength(30);
            e.Property(x => x.FarmAddress).HasMaxLength(300);
            e.Property(x => x.Certificates).HasMaxLength(300);

            e.Property(x => x.TotalAreaHa).HasColumnType("decimal(12,3)");
            e.Property(x => x.RubberAreaHa).HasColumnType("decimal(12,3)");
            e.Property(x => x.TotalExploit).HasColumnType("decimal(12,3)");

            e.Property(x => x.IsActive).HasDefaultValue(true);

            e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
            e.Property(x => x.RegisterPerson).HasMaxLength(50);
            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.Property(x => x.Polygon).HasColumnType("nvarchar(max)");

            e.HasIndex(x => x.FarmCode);
            e.HasIndex(x => x.AgentCode);
        }
    }
}
