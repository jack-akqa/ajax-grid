/* global describe, it, expect, jest, beforeEach, fetch */
import {AjaxForm} from '../src/index.js';
import fetchMock from 'fetch-mock';
import makeRequest from './request';
import fs from 'fs';
import path from 'path';

describe('AjaxForm form', function() {
	it('should throw an error if no form is passed', function() {
		expect(() => {
			new AjaxForm();
		}).toThrowError('You must supply a form element');
	});
	it('should throw an error if passed form is not a valid HTML form', function() {
		expect(() => {
			var p = document.createElement('p');
			new AjaxForm(p);
		}).toThrowError('You must supply a valid HTML form element');
	});
	it('should not throw an error if passed form is a valid HTML form', function() {
		expect(() => {
			var form = document.createElement('form');
			new AjaxForm(form);
		}).not.toThrow();
	});
});

describe('AjaxForm options', function() {
	var validForm, mockOptions;

	beforeEach(() => {
		mockOptions = require('./mock/options/options.json');
		validForm = document.createElement('form');
		return validForm;
	});

	it('Should be injected in the form options', function() {
		const ajaxForm = new AjaxForm(validForm, mockOptions);
		expect(ajaxForm.options).toMatchObject(mockOptions);
	});
});

describe('AjaxForm submission', function() {
	var validForm, mockOptions, serverSuccess, serverError;

	beforeEach(() => {
		mockOptions = require('./mock/options/options.json');
		serverSuccess = require('./mock/server/success.json');
		serverError = require('./mock/server/error.json');
		validForm = fs.readFileSync(path.resolve(__dirname, './mock/form/form.html'), 'utf8');
		document.body.innerHTML = validForm;
	});

	it('Should inject server success message when submission success', async () => {
		const form = document.getElementById('UpdateDetailsForm_UpdateDetailsForm');
		const ajaxForm = new AjaxForm(form, mockOptions);

		fetchMock.get('*', serverSuccess);
		await makeRequest().then(function(data) {
			ajaxForm.handleResponse(data);
			return expect(ajaxForm.state.message).toBe(serverSuccess.Message);
		});
		fetchMock.restore();
	});

	it('Should not inject server success message when submission success if success message option has been set', async () => {
		// add custom success message
		mockOptions.success = {
			message: 'custom success message'
		};

		const form = document.getElementById('UpdateDetailsForm_UpdateDetailsForm');
		const ajaxForm = new AjaxForm(form, mockOptions);

		fetchMock.get('*', serverSuccess);
		await makeRequest().then(function(data) {
			ajaxForm.handleResponse(data);
			return expect(ajaxForm.state.message).toBe(mockOptions.success.message);
		});
		fetchMock.restore();
	});

	it('Should inject server error message when submission fail', async () => {
		const form = document.getElementById('UpdateDetailsForm_UpdateDetailsForm');
		const ajaxForm = new AjaxForm(form, mockOptions);
		// fake dataLayer object
		window.dataLayer = [];

		fetchMock.get('*', serverError);
		await makeRequest().then(function(data) {
			ajaxForm.handleResponse(data);
			return expect(ajaxForm.state.message).toBe(serverError.Message);
		});
		fetchMock.restore();
	});

	it('Should not inject server error message when submission fail if error message option has been set', async () => {
		// add custom success message
		mockOptions.error = {
			message: 'custom error message'
		};

		const form = document.getElementById('UpdateDetailsForm_UpdateDetailsForm');
		const ajaxForm = new AjaxForm(form, mockOptions);

		fetchMock.get('*', serverError);
		await makeRequest().then(function(data) {
			ajaxForm.handleResponse(data);
			return expect(ajaxForm.state.message).toBe(mockOptions.error.message);
		});
		fetchMock.restore();
	});

	it('Should populate the dataLayer with error list', async () => {
		const form = document.getElementById('UpdateDetailsForm_UpdateDetailsForm');
		const ajaxForm = new AjaxForm(form, mockOptions);
		// fake dataLayer object
		window.dataLayer = [];

		fetchMock.get('*', serverError);
		await makeRequest().then(function(data) {
			ajaxForm.handleResponse(data);
			return expect(window.dataLayer.length).toBeGreaterThan(0);
		});
		fetchMock.restore();
	});
});
