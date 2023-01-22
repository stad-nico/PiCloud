export default function isNodeJSErrnoException(e: Error): e is NodeJS.ErrnoException {
	return e instanceof Error;
}
