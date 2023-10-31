'use strict';

// import { serialize } from '@heyday/serialize';
import { serialize } from '~/@heyday/serialize';
import SmoothScroll from 'smooth-scroll';

// fetch api polyfill
import 'whatwg-fetch';
// promise polyfill for old browser
require('es6-promise').polyfill();

/* global dataLayer */
class AjaxForm {
	constructor(form, options) {
		// check passed form parameter
		if (!form) {
			throw new Error('You must supply a form element');
		} else if (!form.nodeName || form.nodeName.toLowerCase() !== 'form') {
			throw new Error('You must supply a valid HTML form element');
		}

		// store form locally
		this.form = form;
		// store smooth scroll instance (if created)
		this.smooth = null;
		// grab form url
		this.fetchUrl = form.action;
		// form state
		this.state = {
			isSubmitting: false,
			isSuccessful: false,
			errors: null
		};

		// merge optional passed options with local
		this.options = {
			button: {
				labelSubmit: 'Submitting...',
				labelReSubmit: 'Send again',
				...options ? options.button : null
			},
			form: {
				class: 'loading',
				errorPosition: 'lastchild',
				...options ? options.form : null
			},
			success: {
				template: '<p>{{message}}</p>',
				...options ? options.success : null
			},
			error: {
				template: '<p>{{message}}</p>',
				...options ? options.error : null
			},
			scrollToError: {
				active: false,
				speed: 500,
				offset: 0,
				easing: 'Linear',
				...options ? options.scrollToError : null
			},
			mergeWith: {
				...options ? options.mergeWith : null
			}
		};

		// attach click event on submit button
		form.addEventListener('submit', this.handleSubmit.bind(this));
	}

	setState(state) {
		this.state = state;
		this.render();
	}

	render() {
		// if form is being submitted add 'loading' class to the form
		// and change form button text
		if (this.state.isSubmitting) {
			this.form.classList.add(this.options.form.class);
			this.updateLabelActionButton(this.options.button.labelSubmit);
		}
		// if the form don't contain any errors
		// replace form by success message
		if (this.state.isSuccessful) {
			this.form.parentNode.innerHTML += this.renderSuccess();
			const form = document.getElementById(this.form.id);
			const formParent = form.parentNode;
			formParent.removeChild(form);
			// once he form has been replaced, scroll to the parent element
			// this is usefull on small device to avoid a fail feeling
			this.scrollToSuccess(formParent);
		}
		// if the form contain error
		// remove loading class to the form and restore
		// original form button value
		if (this.state.errors) {
			this.renderErrors(this.state.errors);
			this.form.classList.remove(this.options.form.class);
			this.updateLabelActionButton(this.options.button.labelReSubmit);
		}
	}

	renderSuccess() {
		// define the template if form submit success
		return this.options.success.template.replace(/{{message}}/g, this.state.message);
	}

	handleSubmit(e) {
		// handle click on submit form
		e.preventDefault();

		// avoid multiple form submit
		if (this.state.isSubmitting) {
			return;
		}

		this.setState({
			...this.state,
			isSubmitting: true,
			errors: null
		});

		// if error has already been set
		// remove everything
		this.resetErrors();

		// store serialized form
		let serializedForm = serialize(this.form);

		// if the form need to send extra data
		// (passed via the 'mergeWith' option)
		// simply loop through the object and
		// add it to the serialized form string
		if (this.options.mergeWith) {
			// key vlue loop
			for (var key in this.options.mergeWith) {
				// check if object exist for that key
				if (this.options.mergeWith.hasOwnProperty(key)) {
					// append the extra information to the end of the serialized
					// form object. the key will be reformat to add '+' sign instead
					// of space: 'Cheese is good' will be replace by 'Cheese+is+good'.
					// Note: we need to manually encode the '&' character othwerise it's
					// getting lost when formatting the request with form data (only if
					// the value is different from undefined)
					if (this.options.mergeWith[key]) {
						serializedForm += `&${key.replace(/ /g, '+')}=${JSON.stringify(this.options.mergeWith[key]).replace('&', '%26')}`;
					}
				}
			}
		}

		// send an ajax request to validate the form
		fetch(this.fetchUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
				'X-Requested-With': 'XMLHttpRequest'
			},
			body: serializedForm,
			credentials: 'same-origin'
		})
		.then(res => res.json())
		.then((res) => {
			this.handleResponse(res);
		}).catch(function(error) {
			console.log('Error: ', error);
		});
	}

	/**
	 * Handle server response
	 * @res object - Server response
	 */
	handleResponse(res) {
		var result = res;

		if (result.Success === true) {
			// add success message and remove the form
			this.setState({
				...this.state,
				isSubmitting: true,
				isSuccessful: true,
				errors: null,
				message: this.options.success.message || result.Message
			});

			if (result.File) {
				window.location.href = result.File;
			}

			// if a smooth has been created
			// destroy if form is successful
			if (this.smooth) {
				this.smooth.destroy();
			}
		} else {
			this.setState({
				...this.state,
				isSubmitting: false,
				isSuccessful: false,
				errors: result.Errors,
				message: this.options.error.message || result.Message
			});

			const errorList = [];
			for (var error in result.Errors) {
				if (result.Errors.hasOwnProperty(error)) {
					var element = result.Errors[error];
					if (element) {
						errorList.push('Error message [' + error + ']: ' + element.message);
					}
				}
			}

			// if options is activated scroll to first error
			// right after submit
			if (this.options.scrollToError.active) {
				this.scrollToFirstError();
			}

			try {
				dataLayer.push({'event': 'contact_form_submit_failed', 'contact-form-name': 'Contact', 'contact-form-action': 'Label', 'contact-form-errors': errorList});
			} catch (error) {
				throw new Error('Missing dataLayer object');
			}
		}
	}

	/**
	 * Scroll to first error field
	 */
	scrollToFirstError() {
		// get first wrong field selection
		// this is based on the 'holdr-required' added
		// to silverstripe field holder when field contain errors
		const firstWrongField = document.getElementsByClassName('holder-required')[0];
		// smooth scroll to this element
		this.smoothScrollTo(firstWrongField);
	}

	/**
	 * Scroll to success message
	 */
	scrollToSuccess(wrapper) {
		// smooth scroll to this element
		this.smoothScrollTo(wrapper);
	}

	/**
	 * Smooth scroll to the passed element
	 * @element HTML element - A valid html node element
	 */
	smoothScrollTo(element) {
		// cancel the call if no element is passed (save memory)
		if (!element) return;
		// otherwise create a smooth scroll instance
		this.smooth = new SmoothScroll();
		// directly animate to passed element
		// using options settings
		this.smooth.animateScroll(element, null, {
			speed: this.options.scrollToError.speed,
			offset: this.options.scrollToError.offset,
			easing: this.options.scrollToError.easing
		});
	}

	/**
	 * Render the form errors
	 * @fields array - List of fields that are not valid
	 */
	renderErrors(fields) {
		if (fields) {
			Object.keys(fields).forEach((key) => {
				const fieldName = fields[key].fieldName;
				const fieldError = fields[key].message;
				const fieldHolder = document.querySelector('#' + this.form.id + '_' + fieldName + '_Holder');

				if (fieldHolder && !fieldHolder.classList.contains('holder-required')) {
					fieldHolder.classList.toggle('holder-required');
					this.renderErrorMessage(fieldHolder, fieldError);
				}
			});
		}
	}

	renderErrorMessage(fieldHolder, fieldError) {
		var error = document.createElement('p');
		let position = (this.options.form.errorPosition === 'firstchild') ? 'afterbegin' : 'beforeend';
		error.setAttribute('class', 'errors message required');
		error.innerHTML = fieldError;
		fieldHolder.insertAdjacentElement(position, error);
	}

	/**
	 * Reset all the errors to let the validator re-process the form
	 */
	resetErrors() {
		/* clear all the errors */
		const fieldHolder = document.getElementsByClassName('field');
		let i = fieldHolder.length;

		while (i--) {
			fieldHolder[i].classList.remove('holder-required');
		}

		var container = document.getElementById(this.form.id);
		var elements = container.getElementsByClassName('errors');
		while (elements[0]) {
			elements[0].parentNode.removeChild(elements[0]);
		}
	}

	updateLabelActionButton(text) {
		// handle different silverstripe scanario
		// in some case (SS3?) the submit button is suffixed by `action_send`
		const buttonSend = document.querySelector(`#${this.form.id}_action_send`);
		// and in other cases suffixed by `action_submit`
		const buttonSubmit = document.querySelector(`#${this.form.id}_action_submit`);
		// pick the button according to one of the configuration described above
		const button = buttonSend || buttonSubmit;

		// handle button that have extra dom element in them
		// e.g: <button><span>Hey!</span><button>
		if (button.hasChildNodes()) {
			// if it's the case update text inside the child nodes
			button.lastChild.textContent = text;
		} else {
			// otherwise simply update button value
			button.value = text;
		}
	}

	IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
}

export {AjaxForm as default};
