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

		// ====== MASTER ======
		public DbSet<RubberAgent> RubberAgents => Set<RubberAgent>();
		public DbSet<RubberFarmDb> RubberFarms => Set<RubberFarmDb>();
		public DbSet<RubberType> RubberTypes => Set<RubberType>();

		// ====== INTAKE ======
		public DbSet<RubberIntakeDb> RubberIntakes => Set<RubberIntakeDb>();

		// ====== POND ======
		public DbSet<RubberPondDb> RubberPonds => Set<RubberPondDb>();
		public DbSet<RubberPondIntakeDb> RubberPondIntakes => Set<RubberPondIntakeDb>();

		// ====== ORDER ======
		public DbSet<RubberOrderDb> RubberOrders => Set<RubberOrderDb>();
		public DbSet<RubberOrderPondDb> RubberOrderPonds => Set<RubberOrderPondDb>();

		// ====== PALLET ======
		public DbSet<RubberPalletDb> RubberPallets => Set<RubberPalletDb>();

		// ====== USER ======
		// Configure entity mappings and relationships
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// ✅ Đổi tên bảng User Identity
			modelBuilder.Entity<UserAccountIdentity>().ToTable("USER_ACCOUNT");

			// ✅ Đổi tên các bảng Identity khác (optional nhưng nên có)
			modelBuilder.Entity<IdentityRole<Guid>>().ToTable("USER_ROLE");
			modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("USER_IN_ROLE");
			modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("USER_CLAIM");
			modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("ROLE_CLAIM");
			modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("USER_LOGIN");
			modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("USER_TOKEN");

			// ✅ Cấu hình thêm cho UserAccountIdentity
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

			modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
		}
	}
}
