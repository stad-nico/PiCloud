import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';

const filesToProcess = process.argv.slice(2);
const author = getGitAuthor();
const currentYear = new Date().getFullYear();

for (const file of filesToProcess) {
	if (!file.endsWith('.ts') || file.endsWith('scripts/insert-copyright.ts')) {
		continue;
	}

	insertDisclaimer(file);
}

function getGitAuthor(): string {
	const author = execSync('git config user.name', { encoding: 'utf8' }).trim();

	if (!author) {
		throw new Error('No author found in Git config.');
	}

	return author;
}

function getDisclaimer(year: number, author: string): string {
	return [
		`/**-------------------------------------------------------------------------`,
		` * Copyright (c) ${year} - ${author}. All rights reserved.`,
		` * Licensed under the MIT License. See the project root for more information.`,
		` *`,
		` * @author ${author}`,
		` *-------------------------------------------------------------------------*/\n`,
	].join('\n');
}

async function insertDisclaimer(filePath: string) {
	const content = (await readFile(filePath)).toString().replace(/\r\n/g, '\n');

	if (!content.includes('Copyright (c)')) {
		console.log(`${filePath} added disclaimer (${author})`);
		return await writeFile(filePath, getDisclaimer(currentYear, author) + content);
	}

	const matches = content.match(/Copyright \(c\) (\d{4}) - (.*). All rights reserved./);

	if (!matches) {
		throw new Error(`Disclaimer already exists but no author or year could be matched in file ${filePath}`);
	}

	const matchedYear = parseInt(matches[1]);

	if (matchedYear === currentYear) {
		return;
	}

	const matchedAuthor = matches[2];

	const oldDisclaimer = getDisclaimer(matchedYear, matchedAuthor);

	console.log(`${filePath} updated disclaimer ${matchedYear} -> ${currentYear}`);

	return await writeFile(filePath, content.replace(oldDisclaimer, getDisclaimer(currentYear, matchedAuthor)));
}
