import AjaxForm from 'ajax-form';

window.addEventListener('DOMContentLoaded', function() {
	// select form document
	const form = document.getElementById('demo');

	// create ajax form object and pass desired options
	const ajaxForm = new AjaxForm(form, {
		button: {
			labelSubmit: 'Processing...'
		},
		success: {
			template: '<p class="type--center color--dark">{{message}}</p>'
		},
		error: {
			template: '<p class="type--center color--brand">{{message}}</p>'
		},
		scrollToError: {
			active: true,
			speed: 250,
			offset: 140,
			easing: 'easeOutQuad'
		},
		mergeWith: {
			'Accessories': [
				{
					id: 1,
					name: 'test accessories & other fancy stuff [test]'
				},
				{
					id: 2,
					name: 'test accessories'
				}
			],
			'AccessoriesPack': [
				{
					id: 1,
					name: 'test pack'
				},
				{
					id: 2,
					name: 'test pack'
				}
			]
		}
	});

	// render form
	ajaxForm.render();
});
