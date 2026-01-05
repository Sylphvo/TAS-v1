using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using TAS.Helpers;
using TAS.Models;

namespace TAS.Data
{
	public class AppDbContext : IdentityDbContext<UserAccountIdentity, IdentityRole<Guid>, Guid>
	{
		public AppDbContext(DbContextOptions<AppDbContext> opt) : base(opt) { }

		// ====== MASTER DATA ======
		public DbSet<RubberAgent> RubberAgents => Set<RubberAgent>();
		public DbSet<RubberFarm> RubberFarms => Set<RubberFarm>();
		public DbSet<RubberType> RubberTypes => Set<RubberType>();
		public DbSet<RubberPond> RubberPonds => Set<RubberPond>();

		// ====== TRANSACTION ======
		public DbSet<RubberIntake> RubberIntakes => Set<RubberIntake>();
		public DbSet<RubberOrder> RubberOrders => Set<RubberOrder>();
		public DbSet<RubberPallet> RubberPallets => Set<RubberPallet>();

		// ====== BRIDGE (Truy xuất nguồn gốc) ======
		public DbSet<RubberPondIntake> RubberPondIntakes => Set<RubberPondIntake>();
		public DbSet<RubberOrderPond> RubberOrderPonds => Set<RubberOrderPond>();
		// ====== CONFIGURATION ======
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// ========================================
			// IDENTITY TABLES
			// ========================================
			modelBuilder.Entity<UserAccountIdentity>().ToTable("USER_ACCOUNT");
			modelBuilder.Entity<IdentityRole<Guid>>().ToTable("USER_ROLE");
			modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("USER_IN_ROLE");
			modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("USER_CLAIM");
			modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("ROLE_CLAIM");
			modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("USER_LOGIN");
			modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("USER_TOKEN");

			modelBuilder.Entity<UserAccountIdentity>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.UserName).HasMaxLength(256).IsRequired();
				entity.Property(e => e.Email).HasMaxLength(256);
				entity.Property(e => e.FirstName).HasMaxLength(100);
				entity.Property(e => e.LastName).HasMaxLength(100);
				entity.HasIndex(e => e.UserName).IsUnique();
				entity.HasIndex(e => e.Email).IsUnique();
			});

			// ========================================
			// RUBBER AGENT (Đại lý)
			// ========================================
			modelBuilder.Entity<RubberAgent>(entity =>
			{
				entity.ToTable("RubberAgent");
				entity.HasKey(e => e.AgentId);

				entity.Property(e => e.AgentCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.AgentCode).IsUnique();

				entity.Property(e => e.AgentName).HasMaxLength(255).IsRequired();
				entity.Property(e => e.OwnerName).HasMaxLength(255);
				entity.Property(e => e.AgentPhone).HasMaxLength(20);
				entity.Property(e => e.AgentAddress).HasMaxLength(500);
				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.IsActive).HasDefaultValue(true);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");
			});

			// ========================================
			// RUBBER FARM (Nhà vườn)
			// ========================================
			modelBuilder.Entity<RubberFarm>(entity =>
			{
				entity.ToTable("RubberFarm");
				entity.HasKey(e => e.FarmId);

				entity.Property(e => e.FarmCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.FarmCode).IsUnique();

				entity.Property(e => e.AgentCode).HasMaxLength(50).IsRequired();
				entity.Property(e => e.FarmerName).HasMaxLength(255).IsRequired();
				entity.Property(e => e.FarmPhone).HasMaxLength(20);
				entity.Property(e => e.FarmAddress).HasMaxLength(500);

				entity.Property(e => e.Certificates).HasMaxLength(500);
				entity.Property(e => e.TotalAreaHa).HasColumnType("decimal(5,2)");
				entity.Property(e => e.RubberAreaHa).HasColumnType("decimal(5,2)");
				entity.Property(e => e.TotalExploit).HasColumnType("decimal(5,2)");

				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.IsActive).HasDefaultValue(true);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");

				// Relationship: Agent -> Farm (1:N)
				entity.HasOne(e => e.Agent)
					.WithMany(a => a.Farms)
					.HasForeignKey(e => e.AgentCode)
					.HasPrincipalKey(a => a.AgentCode)
					.OnDelete(DeleteBehavior.Cascade);
			});

			// ========================================
			// RUBBER TYPE (Loại cao su)
			// ========================================
			modelBuilder.Entity<RubberType>(entity =>
			{
				entity.ToTable("RubberType");
				entity.HasKey(e => e.TypeId);

				entity.Property(e => e.TypeCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.TypeCode).IsUnique();

				entity.Property(e => e.TypeName).HasMaxLength(255).IsRequired();
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);
			});

			// ========================================
			// RUBBER INTAKE (Phiếu thu mua)
			// ========================================
			modelBuilder.Entity<RubberIntake>(entity =>
			{
				entity.ToTable("RubberIntake");
				entity.HasKey(e => e.IntakeId);

				entity.Property(e => e.IntakeCode).HasMaxLength(50);
				entity.Property(e => e.FarmCode).HasMaxLength(50).IsRequired();
				entity.Property(e => e.FarmerName).HasMaxLength(255).IsRequired();
				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.RubberKg).HasColumnType("decimal(10,2)").IsRequired();
				entity.Property(e => e.TSCPercent).HasColumnType("decimal(5,2)");
				entity.Property(e => e.FinishedProductKg).HasColumnType("decimal(10,2)").IsRequired();

				entity.Property(e => e.Status).HasDefaultValue((byte)1);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");

				// Relationship: Farm -> Intake (1:N)
				entity.HasOne(e => e.Farm)
					.WithMany(f => f.Intakes)
					.HasForeignKey(e => e.FarmCode)
					.HasPrincipalKey(f => f.FarmCode)
					.OnDelete(DeleteBehavior.Cascade);
			});

			// ========================================
			// RUBBER POND (Hồ sản xuất)
			// ========================================
			modelBuilder.Entity<RubberPond>(entity =>
			{
				entity.ToTable("RubberPond");
				entity.HasKey(e => e.PondId);

				entity.Property(e => e.PondCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.PondCode).IsUnique();

				entity.Property(e => e.AgentCode).HasMaxLength(50).IsRequired();
				entity.Property(e => e.PondName).HasMaxLength(255).IsRequired();
				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.CapacityKg).HasColumnType("decimal(10,2)").HasDefaultValue(50000.00m);
				entity.Property(e => e.DailyCapacityKg).HasColumnType("decimal(10,2)").HasDefaultValue(5000.00m);
				entity.Property(e => e.CurrentNetKg).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);

				entity.Property(e => e.Status).HasDefaultValue((byte)1);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");

				// Relationship: Agent -> Pond (1:N)
				entity.HasOne(e => e.Agent)
					.WithMany(a => a.Ponds)
					.HasForeignKey(e => e.AgentCode)
					.HasPrincipalKey(a => a.AgentCode)
					.OnDelete(DeleteBehavior.Cascade);
			});

			// ========================================
			// RUBBER POND INTAKE (Bridge: Hồ ← Intake)
			// ========================================
			modelBuilder.Entity<RubberPondIntake>(entity =>
			{
				entity.ToTable("RubberPondIntake");
				entity.HasKey(e => e.PondIntakeId);

				entity.Property(e => e.PouredKg).HasColumnType("decimal(10,2)").IsRequired();
				entity.Property(e => e.PouredAt).IsRequired();

				// Relationship: Pond -> PondIntake (1:N)
				entity.HasOne(e => e.Pond)
					.WithMany(p => p.PondIntakes)
					.HasForeignKey(e => e.PondId)
					.OnDelete(DeleteBehavior.NoAction)
					.IsRequired(false);

				// Relationship: Intake -> PondIntake (1:N)
				entity.HasOne(e => e.Intake)
					.WithMany(i => i.PondIntakes)
					.HasForeignKey(e => e.IntakeId)
					.OnDelete(DeleteBehavior.Cascade);
			});

			// ========================================
			// RUBBER ORDER (Đơn hàng)
			// ========================================
			modelBuilder.Entity<RubberOrder>(entity =>
			{
				entity.ToTable("RubberOrder");
				entity.HasKey(e => e.OrderId);

				entity.Property(e => e.OrderCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.OrderCode).IsUnique();

				entity.Property(e => e.AgentCode).HasMaxLength(50).IsRequired();
				entity.Property(e => e.BuyerName).HasMaxLength(255);
				entity.Property(e => e.BuyerCompany).HasMaxLength(255);
				entity.Property(e => e.ProductType).HasMaxLength(50);
				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.TotalNetKg).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
				entity.Property(e => e.Status).HasDefaultValue((byte)1);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");

				// Relationship: Agent -> Order (1:N)
				entity.HasOne(e => e.Agent)
					.WithMany(a => a.Orders)
					.HasForeignKey(e => e.AgentCode)
					.HasPrincipalKey(a => a.AgentCode)
					.OnDelete(DeleteBehavior.Cascade);
			});

			// ========================================
			// RUBBER ORDER POND (Bridge: Đơn hàng ← Hồ)
			// ========================================
			modelBuilder.Entity<RubberOrderPond>(entity =>
			{
				entity.ToTable("RubberOrderPond");
				entity.HasKey(e => e.OrderPondId);

				entity.Property(e => e.AllocatedKg).HasColumnType("decimal(10,2)").IsRequired();
				entity.Property(e => e.BatchNo).HasMaxLength(50);

				// Relationship: Order -> OrderPond (1:N)
				entity.HasOne(e => e.Order)
					.WithMany(o => o.OrderPonds)
					.HasForeignKey(e => e.OrderId)
					.OnDelete(DeleteBehavior.Cascade);

				// Relationship: Pond -> OrderPond (1:N)
				entity.HasOne(e => e.Pond)
					.WithMany(p => p.OrderPonds)
					.HasForeignKey(e => e.PondId)
					.OnDelete(DeleteBehavior.NoAction)
					.IsRequired(false);
			});

			// ========================================
			// RUBBER PALLET
			// ========================================
			modelBuilder.Entity<RubberPallet>(entity =>
			{
				entity.ToTable("RubberPallets");
				entity.HasKey(e => e.PalletId);

				entity.Property(e => e.PalletCode).HasMaxLength(50).IsRequired();
				entity.HasIndex(e => e.PalletCode).IsUnique();

				entity.Property(e => e.PalletName).HasMaxLength(255);
				entity.Property(e => e.RegisterPerson).HasMaxLength(50);
				entity.Property(e => e.UpdatePerson).HasMaxLength(50);

				entity.Property(e => e.WeightKg).HasColumnType("decimal(10,2)").IsRequired();
				entity.Property(e => e.StandardWeightKg).HasColumnType("decimal(10,2)").HasDefaultValue(2325.00m);

				entity.Property(e => e.IsActive).HasDefaultValue(true);
				entity.Property(e => e.Status).HasDefaultValue((byte)1);
				entity.Property(e => e.RegisterDate).HasDefaultValueSql("SYSDATETIME()");

				// Relationship: Order -> Pallet (1:N)
				entity.HasOne(e => e.Order)
					.WithMany(o => o.Pallets)
					.HasForeignKey(e => e.OrderId)
					.OnDelete(DeleteBehavior.Cascade);

				// Relationship: Pond -> Pallet (1:N, Optional)
				// NoAction để tránh multiple cascade paths
				entity.HasOne(e => e.Pond)
					.WithMany(p => p.Pallets)
					.HasForeignKey(e => e.PondId)
					.OnDelete(DeleteBehavior.NoAction)
					.IsRequired(false);
			});
		}
	}
}