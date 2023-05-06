export default interface MigrationsExecutor {

    execute(migrationsDirname: string): Promise<void>;

}