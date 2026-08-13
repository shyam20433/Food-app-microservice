import { BaseCommand } from '@adonisjs/core/build/standalone';
export default class MakeModel extends BaseCommand {
    static commandName: string;
    static description: string;
    /**
     * The name of the model file.
     */
    name: string;
    /**
     * Defines if we generate the migration for the model.
     */
    migration: boolean;
    /**
     * Defines if we generate the controller for the model.
     */
    controller: boolean;
    /**
     * This command loads the application
     */
    static settings: {
        loadApp: boolean;
    };
    /**
     * Execute command
     */
    run(): Promise<void>;
}
