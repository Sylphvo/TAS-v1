using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Models;

namespace TAS.Configurations
{
	public class RubberPalletConfiguration : IEntityTypeConfiguration<RubberPalletDb>
	{
		public void Configure(EntityTypeBuilder<RubberPalletDb> e)
		{
			e.ToTable("RubberPallets");
			e.HasKey(x => x.PalletId);

			e.Property(x => x.OrderId).IsRequired();
			// ✅ PondId (nullable)
			e.HasIndex(x => x.PondId);
			// FK -> RubberPond(PondId)
			e.HasOne<RubberPondDb>()
			 .WithMany()
			 .HasForeignKey(x => x.PondId)
			 .OnDelete(DeleteBehavior.Restrict);
			 
			e.Property(x => x.PalletCode).HasMaxLength(50).IsRequired();
			e.Property(x => x.PalletName).HasMaxLength(100).IsRequired();

			e.Property(x => x.WeightKg).HasColumnType("decimal(12,3)");
			e.Property(x => x.IsActive).HasDefaultValue(1);

			e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
			e.Property(x => x.RegisterPerson).HasMaxLength(50);
			e.Property(x => x.UpdatePerson).HasMaxLength(50);

			e.HasIndex(x => x.OrderId);
			e.HasIndex(x => x.PalletCode);
		}
	}
}
