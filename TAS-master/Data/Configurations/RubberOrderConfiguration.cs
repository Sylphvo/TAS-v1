using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
    public class RubberOrderConfiguration : IEntityTypeConfiguration<RubberOrderDb>
    {
        public void Configure(EntityTypeBuilder<RubberOrderDb> e)
        {
            e.ToTable("RubberOrder");
            e.HasKey(x => x.OrderId);

            e.Property(x => x.OrderCode).HasMaxLength(50);
            e.Property(x => x.AgentCode).HasMaxLength(50);

            e.Property(x => x.BuyerName).HasMaxLength(120);
            e.Property(x => x.BuyerCompany).HasMaxLength(200);
            e.Property(x => x.ContractNo).HasMaxLength(80);

            e.Property(x => x.Destination).HasMaxLength(200);
            e.Property(x => x.DeliveryAddress).HasMaxLength(300);
            e.Property(x => x.ProductType).HasMaxLength(50);

            e.Property(x => x.TargetTSC).HasColumnType("decimal(5,2)");
            e.Property(x => x.TargetDRC).HasColumnType("decimal(5,2)");
            e.Property(x => x.TotalNetKg).HasColumnType("decimal(12,3)");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");

            e.Property(x => x.Note).HasMaxLength(500);

            e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
            e.Property(x => x.RegisterPerson).HasMaxLength(50);
            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.Property(x => x.Status).HasDefaultValue(0);

            e.HasIndex(x => x.OrderCode);
            e.HasIndex(x => x.AgentCode);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.OrderDate);
        }
    }
}
