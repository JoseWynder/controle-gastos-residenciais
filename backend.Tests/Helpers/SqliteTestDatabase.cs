using ControleGastos.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Tests.Helpers;

public sealed class SqliteTestDatabase : IAsyncDisposable
{
    private readonly SqliteConnection _connection;

    private SqliteTestDatabase(SqliteConnection connection)
    {
        _connection = connection;
    }

    public static async Task<SqliteTestDatabase> CreateAsync()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var database = new SqliteTestDatabase(connection);
        await using var context = database.CreateContext();
        await context.Database.EnsureCreatedAsync();

        return database;
    }

    public AppDbContext CreateContext()
    {
        return new AppDbContext(CreateOptions());
    }

    public async ValueTask DisposeAsync()
    {
        await _connection.DisposeAsync();
    }

    private DbContextOptions<AppDbContext> CreateOptions()
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;
    }
}