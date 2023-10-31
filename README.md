# Ajax Form

Ajax form submission with backend validation.

## Server-side

Keep in mind that some tweaks are required on the Silverstripe side to make this module to work. See the server-side specific documentation [here](https://git.heyday.net.nz/heyday/ajax-form/blob/master/SERVER-SIDE.md)

## Install

### **NPM / Yarn**

Install the package:

`npm install @heyday/ajax-form`

or

`yarn add @heyday/ajax-form`


### **Usage**

Import the module in your project:
```js
import { AjaxForm } from '@heyday/ajax-form';
```

Instanciate module:
```js
const ajaxForm = new AjaxForm(form);
ajaxForm.render();
```

**Note:**
*The first parameter must be a valid HTML form element (the module will throw an error otherwise).*

### **Options**

You can pass an object as a second parameter to change the way the component will handle your form. This will give you the possibility to change labels, classes applied, success template and message...

Note that every option are optional, just pick the one that you want/need.

![](https://media.giphy.com/media/U86dK3B1QK7eg/giphy.gif)

Object structure:

```js
 {
	button: {
		labelSubmit: 'Submitting...',
		labelReSubmit: 'Send again'
	},
	form: {
		class: 'loading',
		errorPosition: 'firstchild'
	},
	success: {
		template: '<p><b>{{message}}</b></p>',
		message: 'Good boy'
	},
	error: {
		template: '<p><b>{{message}}</b></p>',
		message: 'It is not a bug, it is a feature'
	},
	scrollToError: {
		active: false,
		speed: 500,
		offset: 0,
		easing: 'Linear',
	},
	mergeWith: {
		groceries: [
			'Baguette',
			'Cheese'
		]
	}
}
```
Option breakdown:

**button**

| Parameter | Default | Description |
| --- | --- | --- | --- |
| labelSubmit | `Submitting...` | Label of the button once clicked |
| labelReSubmit | `Send again` | New label of the button when form have been submitted once but errors occurs |


**form**

| Parameter | Default | Description |
| --- | --- | --- | --- |
| class | `loading` | Class applied when form is being submitted. This can handle a "processing" state for the form. |
| errorPosition | `lastchild` | Define where the error should be positioned in the field holder. Available options: `firstchild` will display the error as the first child of the field holder, `lastchild` will display it, well... you can guess. |

**success & error**

| Parameter | Default | Description |
| --- | --- | --- | --- |
| template | `<p>{{message}}</p>` | html structure that will take place once the form has been successfully validated. The `{{message}}` variable will be replaced by the success or error message. |
| message | null | By default the message from the server will be displayed. This will be overriden if you set this variable. |

**scrollToError**

| Parameter | Default | Description |
| --- | --- | --- | --- |
| active | `false` | set that option to true if you want to activate scroll to first error on form submit. |
| speed | `500` | The speed of the smooth scroll to field |
| offset | `0` | A value that will be added to the top of scrolled field. |
| easing | `Linear` | The easing pattern desired for the scroll. |

**mergeWith**

If you need to merge extra data with an existing form this is the way to go. 
Simply add a list of key/value object and this will be appended at the end of the serialize form string.


***Example:***

```js
mergeWith: {
	groceries: [
		'Baguette',
		'Cheese'
	],
	recipes: {
		'raclette': [
			'cheese',
			'potatoes'
		]
	}
}

```

Will be concatenate like so: 

`...&groceries=["Baguette","Cheese"]&recipes={"raclette":["cheese","potatoes"]}`




Available easing options:

**Ease-In (_Gradually increases in speed_)**
- `easeInQuad`
- `easeInCubic`
- `easeInQuart`
- `easeInQuint`

**Ease-In-Out (Gradually increases in speed, peaks, and then gradually slows down.)**
- `easeInOutQuad`
- `easeInOutCubic`
- `easeInOutQuart`
- `easeInOutQuint`

**Ease-Out (Gradually decreases in speed).**
- `easeOutQuad`
- `easeOutCubic`
- `easeOutQuart`
- `easeOutQuart`

If needed, a custom easing option can be added at some point in the future.

## Todo
- [x] Write doc
- [x] Throw error if no form is passed or if not a HTML form element.
- [x] Write test
- [x] Replace `superagent` dependency with fetch with polyfill (IE 11 and below support)
- [x] Auto scroll to first wrong field on submit.
- [ ] Add validation when focus out on every fields.
