// ==UserScript==
// @name Form Autocomplete
// @description Autocompletes forms.
// @include *
// @version 0.1.1
// @copyright Carlos Francisco Ragout
// ==/UserScript==

var c_email = 'auto@complet.ed';
var c_tel = '5555555555';
var c_zip = '66666'
var c_number = '7777';
var c_text = 'autocompleted';
var c_password = 'Pi3141592!';
var c_birthdate = '01/01/1968';
var c_dni = '23345564';
var c_textarea = 'autocompleted information';

function fireInputEvent(el) {
// Fire input event. Input event is used by angular to know when an input element has changed.
	var evt = new CustomEvent("input");
	el.dispatchEvent(evt);
};

function simulateClick(element) {
// Simulate click event on checkboxes and radio buttons. This let angular know there has been changes in order to update the model.
	var event = new MouseEvent('click', {
		'view': window,
		'bubbles': true,
		'cancelable': true
	});

	element.dispatchEvent(event);
};

function simulateBlur(element) {
	var event = new MouseEvent('blur', {
		'view': window,
		'bubbles': true,
		'cancelable': true
	});

	element.dispatchEvent(event);
};

function simulateChange(element) {
// Simulate change event on selects. This let angular know there has been changes in order to update the model.
	var event = new MouseEvent('change', {
		'view': window,
		'bubbles': true,
		'cancelable': true
	});

	element.dispatchEvent(event);
};

function empty(obj) {
	return ((obj == '') || (obj == null));
};

function completeInputNumber(inputElement) {
	if (inputElement.maxLength != null) {
		for (var i = 0; i < inputElement.maxLength; i++) {
			inputElement.value += Math.floor((Math.random() * 10));
		}
	} else {
		inputElement.value = c_number;
	}
};

function guessInputRealType(inputElement) {
	var nameOrId = inputElement.name || inputElement.id;
	nameOrId = nameOrId.toLowerCase();

	if (nameOrId.indexOf("mail") > -1) {
		inputElement.value = c_email;
		return;
	}

	if (nameOrId.indexOf("phone") > -1) {
		inputElement.value = c_tel;
		return;
	}

	if ((nameOrId.indexOf("zip") > -1) || (nameOrId.indexOf("postal") > -1)) {
		inputElement.value = c_zip;
		return;
	}

	if (nameOrId.indexOf("dni") > -1) {
		inputElement.value = c_dni;
		return;
	}

	if (nameOrId.indexOf("number") > -1) {
		completeInputNumber(inputElement);
		return;
	}

	if (nameOrId.indexOf("date") > -1) {
		inputElement.value = c_birthdate;
		return;
	}

	if (nameOrId.indexOf("captcha") > -1) {
		return;
	}

	inputElement.value = c_text;

};

function completeInputElement(inputElement) {
	var inputRequired = inputElement.getAttribute('required') || inputElement.getAttribute('aria-required') || inputElement.getAttribute('ng-required');

	if (inputElement.class == 'fa_ignore-element') {
		return;
	}

	var onlyRequired = document.getElementById('fa_required-checkbox').checked;
	if ((!inputRequired) && (onlyRequired)) {
		return;
	}

	var onlyEmpty = document.getElementById('fa_empty-checkbox').checked;
	var isCheckboxOrRadio = inputElement.type == 'checkbox' || inputElement.type == 'radio';
	if ((!empty(inputElement.value)) && (onlyEmpty) && (!isCheckboxOrRadio)) {
		return;
	}


	switch(inputElement.type) {
		case 'text':
			guessInputRealType(inputElement);
			fireInputEvent(inputElement);
		break;
		case 'password':
			inputElement.value = c_password;
			fireInputEvent(inputElement);
		break;
		case 'email':
			inputElement.value = c_email;
			fireInputEvent(inputElement);
		break;
		case 'tel':
			inputElement.value = c_tel;
			fireInputEvent(inputElement);
		break;
		case 'radio':
			if (!inputElement.checked){
				simulateClick(inputElement);
			}
		break;
		case 'checkbox':
			if (!inputElement.checked) {
				simulateClick(inputElement);
			}
		break;
	}

	simulateBlur(inputElement);
};

function completeSelectElement(selectElement) {
	var ignoreSelect = document.getElementById('fa_ignore-select-checkbox').checked;

	if ((selectElement.class == 'fa_ignore-element') || (ignoreSelect)) {
		return;
	}

	if ((selectElement.children[selectElement.children.length - 2] != null) && (selectElement.children.length > 2)) {
		// Select the option prior to the last one
		selectElement.children[selectElement.children.length - 2].selected = true;
		simulateClick(selectElement.children[selectElement.children.length - 2]);
	} else if (selectElement.children[selectElement.children.length - 1] != null) {
		// Select last option
		selectElement.children[selectElement.children.length - 1].selected = true;
		simulateClick(selectElement.children[selectElement.children.length - 1]);
	}

	simulateChange(selectElement);
};

function completeTextareaElement(textareaElement) {
	textareaElement.value = c_textarea;
	simulateBlur(textareaElement);
};

function completeFormElement(formElement) {
	var element = formElement.tagName.toLowerCase();

	if (element == 'input') {
		completeInputElement(formElement);
	} else if (element == 'select') {
		completeSelectElement(formElement);
	} else if (element == 'textarea') {
		completeTextareaElement(formElement);
	}
};

function completeFormElements(form) {
	// var form = document.getElementsByTagName('form')[formIndex];
console.log(form);
	for (var i = 0; i < form.elements.length; i++) {
		completeFormElement(form.elements[i]);
	}
};

function resetSelectElement(selectElement) {
	if (selectElement.class == 'fa_ignore-element') {
		return;
	}

	if (selectElement.children[0] != null) {
		selectElement.children[0].selected = true;
	}
};

function resetAllSelectElements() {
	var selectElements = document.getElementsByTagName('select');

	for (var i = 0; i < selectElements.length; i++) {
		resetSelectElement(selectElements[i]);
	}
};

function resetFormElement(formElement) {
	var element = formElement.tagName.toLowerCase();

	if (element == 'input') {
		resetInputElement(formElement);
	} else if (element == 'select') {
		resetSelectElement(formElement);
	}
};

function resetFormElements(formIndex) {
	var form = document.getElementsByTagName('form')[formIndex];

	for (var i = 0; i < form.elements.length; i++) {
		resetFormElement(form.elements[i]);
	}
};

function resetInputElement(inputElement) {
	if (inputElement.class == 'fa_ignore-element') {
		return;
	}

	if ((inputElement.type == 'hidden') || (inputElement.type == 'submit')) {
		return;
	}

	if ((inputElement.type == 'checkbox') || (inputElement.type == 'radio')) {
		if (inputElement.checked) {
			simulateClick(inputElement);
		}
	} else {
		inputElement.value = '';
	}
};

function resetAllInputElements() {
	var inputElements = document.getElementsByTagName('input');

	for (var i = 0; i < inputElements.length; i++) {
		resetInputElement(inputElements[i]);
	}
};

function resetAllElements() {
	resetAllSelectElements();
	resetAllInputElements();
};

function completeAllElements() {
	var forms = document.getElementsByTagName('form');
	for (var i = 0; i < forms.length; i++) {
		completeFormElements(forms[i]);
	}
};

function emptySelect(selectElement) {
  for (var i = 0; i <= selectElement.options.length; i++) {
		selectElement.options[i] = null;
	}
	selectElement.options[0] = null
};

function populateFormSelect(selectList) {
	var forms = document.getElementsByTagName('form');
	var placeHolder = document.createElement("option");
	placeHolder.text = 'Complete only in form...';
	placeHolder.value = -1;
	selectList.appendChild(placeHolder);

	for (var i = 0; i < forms.length; i++) {
		var option = document.createElement("option");
		option.value = i;
		option.text = forms[i].id || forms[i].name || 'Form ' + i;
		selectList.appendChild(option);
	}
};


function initFormAutocomplete() {
	var completeButton = document.createElement('button');
	var resetButton = document.createElement('button');
	var refreshFormSelect = document.createElement('button');
	var requiredCheckbox = document.createElement('input');
	var requiredLabel = document.createElement('label');
	var emptyLabel = document.createElement('label');
	var emptyCheckbox = document.createElement('input');
	var ignoreSelectLabel = document.createElement('label');
	var ignoreSelectCheckbox = document.createElement('input');

	var toggleContainerCheckbox = document.createElement('input');
	var toggleContainerLabel = document.createElement('label');

	var formSelect = document.createElement('select');

	var container = document.createElement('div');
	var optionsContainer = document.createElement('div');
	var containerBar = document.createElement('div');

	var buttonCss = 'margin-left:10px;font-family:calibri;color:black;line-height:100%;padding:2px;height:23px;min-width:initial;width:initial;font-size:12px;';

	//  CSS And attribute values.
	container.setAttribute('style', 'margin-top:-35px;color: white;height: 30px;width: 100%;border-bottom-style: solid;border-bottom-width: 1px;border-color: red;text-align: left;font-family: Calibri;font-size: 12pt;padding-top: 5px;position: absolute;z-index: 999999999999;background-color: black;');
	container.id = 'fa_container-div';
	containerBar.setAttribute('style', 'background-color: red;cursor:pointer;height:15px;');
	optionsContainer.setAttribute('style', 'padding-left: 10px;');

	requiredCheckbox.type = 'checkbox';
	requiredCheckbox.id = 'fa_required-checkbox';
	requiredCheckbox.class = 'fa_ignore-element';
	requiredCheckbox.setAttribute('style', 'margin-left:5px;-webkit-appearance:checkbox;');

	requiredLabel.appendChild(document.createTextNode('Complete only required'));
	requiredLabel.appendChild(requiredCheckbox);
	requiredLabel.setAttribute('style', 'margin-left:20px;font-family:calibri;color:#666;font-size:13px;display:inline;');

	emptyCheckbox.type = 'checkbox';
	emptyCheckbox.id = 'fa_empty-checkbox';
	emptyCheckbox.class = 'fa_ignore-element';
	emptyCheckbox.checked = true;
	emptyCheckbox.setAttribute('style', 'margin-left:5px;-webkit-appearance:checkbox;');

	emptyLabel.appendChild(document.createTextNode('Complete only empty'));
	emptyLabel.appendChild(emptyCheckbox);
	emptyLabel.setAttribute('style', 'margin-left:20px;font-family:calibri;color:#666;font-size:13px;display:inline;');

	ignoreSelectCheckbox.type = 'checkbox';
	ignoreSelectCheckbox.id = 'fa_ignore-select-checkbox';
	ignoreSelectCheckbox.class = 'fa_ignore-element';
	ignoreSelectCheckbox.checked = false;
	ignoreSelectCheckbox.setAttribute('style', 'margin-left:5px;-webkit-appearance:checkbox;');

	ignoreSelectLabel.appendChild(document.createTextNode('Ignore selects'));
	ignoreSelectLabel.appendChild(ignoreSelectCheckbox);
	ignoreSelectLabel.setAttribute('style', 'margin-left:20px;font-family:calibri;color:#666;font-size:13px;display:inline;');

	toggleContainerCheckbox.type = 'checkbox';
	toggleContainerCheckbox.id = 'fa_hide-checkbox';
	toggleContainerCheckbox.class = 'fa_ignore-element';
	toggleContainerCheckbox.checked = true;
	toggleContainerCheckbox.setAttribute('style', 'margin-left:5px;-webkit-appearance:checkbox;');

	toggleContainerLabel.appendChild(document.createTextNode('Hide'));
	toggleContainerLabel.appendChild(toggleContainerCheckbox);
	toggleContainerLabel.setAttribute('style', 'margin-right:10px;float:right;font-family:calibri;color:#666;font-size:13px;display:inline;');

	completeButton.appendChild(document.createTextNode('Autocomplete'));
	completeButton.setAttribute('style', buttonCss);

	resetButton.appendChild(document.createTextNode('Reset'));
	resetButton.setAttribute('style', buttonCss);

	refreshFormSelect.appendChild(document.createTextNode('Refresh list'));
	refreshFormSelect.setAttribute('style', buttonCss);

	populateFormSelect(formSelect);
	formSelect.id = 'fa_forms-select';
	formSelect.class = 'fa_ignore-element';
	formSelect.setAttribute('style', 'margin-left: 15px;width: initial;height: initial;font-size: initial;line-height: 100%;font-family: calibri;padding: initial;border-radius: initial;');

	//  Events
	completeButton.addEventListener('click', function() {
		var formSelect = document.getElementById('fa_forms-select');

		if (formSelect.value > -1) {
			completeFormElements(document.getElementsByTagName('form')[formSelect.value]);
		} else {
			completeAllElements();
		}

	}, true);

	resetButton.addEventListener('click', function() {
		var formSelect = document.getElementById('fa_forms-select');

		if (formSelect.value > -1) {
			resetFormElements(formSelect.value);
		} else {
			resetAllElements();
		}

	}, true);

	refreshFormSelect.addEventListener('click', function() {
		var formSelect = document.getElementById('fa_forms-select');
		emptySelect(formSelect);
		populateFormSelect(formSelect);
	}, true);

	toggleContainerCheckbox.addEventListener('change', function() {


		if (document.getElementById('fa_hide-checkbox').checked) {
			container.style.marginTop = '-35px';
			containerBar.style.height = '15px';
		}

	}, true);

	containerBar.addEventListener('click', function() {

		if (document.getElementById('fa_hide-checkbox').checked) {
			containerBar.style.height = '0px';
			container.style.marginTop = '0px';

			document.getElementById('fa_hide-checkbox').checked = false;
		}

	});

	//  Dom
	optionsContainer.appendChild(completeButton);
	// Reset button is temporarily disabled...
	//optionsContainer.appendChild(resetButton);
	optionsContainer.appendChild(requiredLabel);
	optionsContainer.appendChild(emptyLabel);
	optionsContainer.appendChild(toggleContainerLabel);
	optionsContainer.appendChild(ignoreSelectLabel);
	optionsContainer.appendChild(formSelect);
	optionsContainer.appendChild(refreshFormSelect);
	container.appendChild(optionsContainer);
	container.appendChild(containerBar);

	document.body.insertBefore(container, document.body.firstChild);

};


initFormAutocomplete();