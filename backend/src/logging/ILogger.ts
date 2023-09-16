export interface ILogger {
	debug(message: string, context: string | undefined): void;
	debug(message: string): void;

	log(message: string, context: string | undefined): void;
	log(message: string): void;

	warn(message: string, context: string | undefined): void;
	warn(message: string): void;

	error(message: string, context: string | undefined): void;
	error(message: string): void;

	fatal(message: string, context: string | undefined): void;
	fatal(message: string): void;
}
