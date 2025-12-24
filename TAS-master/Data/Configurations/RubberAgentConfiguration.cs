using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TAS.Helpers;

namespace TAS.Configurations
{
    public class RubberAgentConfiguration : IEntityTypeConfiguration<RubberAgent>
    {
        public void Configure(EntityTypeBuilder<RubberAgent> e)
        {
            e.ToTable("RubberAgent");
            e.HasKey(x => x.AgentId);

            e.Property(x => x.AgentCode).HasMaxLength(50);
            e.Property(x => x.AgentName).HasMaxLength(200);
            e.Property(x => x.OwnerName).HasMaxLength(200);
            e.Property(x => x.TaxCode).HasMaxLength(50);
            e.Property(x => x.AgentAddress).HasMaxLength(300);

            e.Property(x => x.IsActive).HasDefaultValue(1);
            e.Property(x => x.RegisterDate).HasDefaultValueSql("GETDATE()");
            e.Property(x => x.RegisterPerson).HasMaxLength(50);
            e.Property(x => x.UpdatePerson).HasMaxLength(50);

            e.HasIndex(x => x.AgentCode);
        }
    }
}
