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

	static log(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#log method only accepts strings and objects.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#d9d9d9', 'white')(os.userInfo().username.toLowerCase())} ${chalk.gray('LOG     ')} ${gradientString('gray', 'white')(string)}`);
	}

	static info(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#info method only accepts strings and objects.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#2be6ff', '#59baff')(os.userInfo().username.toLowerCase())} ${chalk.gray('INFO    ')} ${gradientString('#59baff', '#2be6ff')(string)}`);
	}

	static warn(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#warn method only accepts strings and objects.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('yellow', 'orange')(os.userInfo().username.toLowerCase())} ${chalk.gray('WARN    ')} ${gradientString('orange', 'yellow')(string)}`);
	}

	static debug(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#debug method only accepts strings and objects.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('magenta', 'hotpink')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('hotpink', 'magenta')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('magenta', 'hotpink')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('hotpink', 'magenta')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('magenta', 'hotpink')(os.userInfo().username.toLowerCase())} ${chalk.gray('DEBUG   ')} ${gradientString('hotpink', 'magenta')(string)}`);
	}

	static success(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#success method only accepts strings and objects.');

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('lime', 'lightgreen')(os.userInfo().username.toLowerCase())} ${chalk.gray('SUCCESS ')} ${gradientString('lime', 'lightgreen')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('lime', 'lightgreen')(os.userInfo().username.toLowerCase())} ${chalk.gray('SUCCESS ')} ${gradientString('lime', 'lightgreen')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('lime', 'lightgreen')(os.userInfo().username.toLowerCase())} ${chalk.gray('SUCCESS ')} ${gradientString('lime', 'lightgreen')(string)}`);
	}

	static error(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) {
			const error = string.stack?.split('\n');
			console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(error?.shift())}`);
			return console.log(error?.join('\n'));
		}

		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#eb7474', 'red')(os.userInfo().username.toLowerCase())} ${chalk.gray('ERROR   ')} ${gradientString('red', '#eb7474')(string)}`);
	}

	static verbose(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#verbose method only accepts strings and objects.');
		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#8f99ff', '#5865f2')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#5865f2', '#8f99ff')(string)}`);
	}

	static verbose2(string: any = 'Empty response', optionalParams: any[] = []) {
		// @ts-ignore
		if ((string instanceof Error)) throw new TypeError('The Logger#verbose2 method only accepts strings and objects.');
		if (typeof string === 'object') {
			return console.log(`${this.date()} ${gradientString('#ff52f1', '#a303ff')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#ff52f1', '#5f03ff')(JSON.stringify(string))}`);
		}

		if (optionalParams && optionalParams.length !== 0) {
			return console.log(`${this.date()} ${gradientString('#ff52f1', '#a303ff')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#ff52f1', '#5f03ff')(string)}`, ...optionalParams);
		}

		return console.log(`${this.date()} ${gradientString('#ff52f1', '#a303ff')(os.userInfo().username.toLowerCase())} ${chalk.gray('VERBOSE ')} ${gradientString('#ff52f1', '#5f03ff')(string)}`);
	}

}