// @ts-ignore
// const { Console } = require('console');
import chalk from "chalk";
// const fs = require('fs');
import os from "os";
import gradientString from "gradient-string";

export default class {

	/**
	 * This will not do anything. Instantiating will not make it special.
	 */
	constructor() {
		throw new Error(`You don't instantiate a logger.`);
	}

	private static date() {
		const date: Date = new Date();
		const parseNumber = (number = 5) => (number.toString().length === 1 ? `0${number}` : number);
		return [
			`${date.getFullYear()}-${parseNumber(date.getMonth() + 1)}-${parseNumber(date.getDate())}`,
			` ${parseNumber(date.getHours())}:${parseNumber(date.getMinutes())}:${parseNumber(date.getSeconds())}`
		].join('');
	}

	static log(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#log method only accepts strings.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(string)}`);
	}

	static info(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#info method only accepts strings.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(string)}`);
	}

	static warn(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#warn method only accepts strings.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(string)}`);
	}

	static debug(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#debug method only accepts strings.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('lightgreen', 'lime')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('lightgreen', 'lime')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('lightgreen', 'lime')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('lightgreen', 'lime')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('lightgreen', 'lime')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('lightgreen', 'lime')(string)}`);
	}

	static error(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) {
			const error = string.stack?.split('\n');
			console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(error?.shift())}`);
			return console.log(gradientString('red', '#eb7474').multiline(error?.join('\n')));
		}

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(string)}`);
	}

	static verbose(string: string = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#verbose method only accepts strings.');
		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(string)}`);
	}

}