// ==UserScript==
// @name Form Autocomplete
// @description Autocompletes forms.
// @include http://127.0.0.1:9000/
// @version 1.0.0
// @copyright Carlos Francisco Ragout
// ==/UserScript==

var c_email = 'auto@complet.ed';
var c_tel = '5555555555';
var c_zip = '71666'
var c_number = '7777';
var c_text = 'autocompleted';
var c_password = 'Pi3141592!';
var c_birthdate = '01/01/1968';
var c_dni = '23345564';
var c_textarea = 'autocompleted information';

var userDefinedValues = null;
var predefinedTextareaShowing = false;

var ignoredElements = null;
var ignoreTextareaShowing = false;

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

function getElementPredefinedValue(element) {
	var id = element.id || element.name;
	if ((!empty(userDefinedValues)) && (userDefinedValues[id] != null)) {
		return userDefinedValues[id];
	}

	return null;
};

function elementIsRadioOrCheckbox(element) {
	return ( (element.tagName.toLowerCase() == 'input') && ((element.type == 'checkbox') || (element.type == 'radio')) )
};

function completeInputElement(inputElement) {
	var inputRequired = inputElement.getAttribute('required') || inputElement.getAttribute('aria-required') || inputElement.getAttribute('ng-required');

	if  ((!empty(ignoredElements)) && (ignoredElements[inputElement.id] != null)) {
		return;
	}

	if (inputElement.class == 'fa_ignore-element') {
		return;
	}

	var onlyRequired = document.getElementById('fa_required-checkbox').checked;
	if ((!inputRequired) && (onlyRequired)) {
		return;
	}

	var onlyEmpty = document.getElementById('fa_empty-checkbox').checked;
	var isCheckboxOrRadio = elementIsRadioOrCheckbox(inputElement);
	if ((!empty(inputElement.value)) && (onlyEmpty) && (!isCheckboxOrRadio)) {
		return;
	}

	var predefinedValue = getElementPredefinedValue(inputElement);
	switch(inputElement.type) {
		case 'text':
			if (predefinedValue == null) {
				guessInputRealType(inputElement);
			} else {
				inputElement.value = predefinedValue;
			}
			fireInputEvent(inputElement);
		break;
		case 'password':
			inputElement.value = predefinedValue || c_password;
			fireInputEvent(inputElement);
		break;
		case 'email':
			inputElement.value = predefinedValue || c_email;
			fireInputEvent(inputElement);
		break;
		case 'tel':
			inputElement.value = predefinedValue || c_tel;
			fireInputEvent(inputElement);
		break;
		case 'radio':
			if (predefinedValue == null){
				simulateClick(inputElement);
			} else if ((!inputElement.checked) && (predefinedValue == true)) {
				simulateClick(inputElement);
			} else if ((inputElement.checked) && (predefinedValue == false)) {
				simulateClick(inputElement);
			}
		break;
		case 'checkbox':
			if (predefinedValue == null){
				simulateClick(inputElement);
			} else if ((!inputElement.checked) && (predefinedValue == true)) {
				simulateClick(inputElement);
			} else if ((inputElement.checked) && (predefinedValue == false)) {
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

	var predefinedValue = getElementPredefinedValue(selectElement);
	if ((!empty(predefinedValue)) && (selectElement.children[predefinedValue] != null)) {
		selectElement.children[predefinedValue].selected = true;
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

	if (elementIsRadioOrCheckbox(inputElement)) {
		if (inputElement.checked) {
			simulateClick(inputElement);
		}
	} else {
		inputElement.value = '';
	}
};

function getInputElementsJSON() {
// Returns a JSON like string of every input element. Key is input id, value is input type.
	var inputs = document.getElementsByTagName('input');
	var eg = "{\n";
	for (var i = 0; i < inputs.length; i++) {
		if (!empty(inputs[i].id)) {
			eg += '\t"' + inputs[i].id + '": "'+ inputs[i].type +'"';
			if (i != inputs.length - 1) {
				eg += ',\n';
			} else {
				eg += '\n';
			}
		}
	}
	eg += "}";
	return eg;
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
	var elements = [];
	elements.push(document.getElementsByTagName('input'));
	elements.push(document.getElementsByTagName('select'));
	elements.push(document.getElementsByTagName('textarea'));
	for (var i = 0; i < elements.length; i++) {
		for (var j = 0; j < elements[i].length; j++) {
			completeFormElement(elements[i][j]);
		}
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
	var inputElementsJSONButton = document.createElement('button');
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

	var userDefinedDataTextarea = document.createElement('textarea');
	var userDefinedDataTextareaToggleButton = document.createElement('button');

	var ignoreTextarea = document.createElement('textarea');
	var ignoreTextareaToggleButton = document.createElement('button');

	//  CSS And attribute values.
	var buttonCss = 'margin-left:10px;font-family:calibri;color:black;line-height:100%;padding:2px;height:23px;min-width:initial;width:initial;font-size:12px;';
	var textareaCss = 'font-family:calibri;color:#666;width: 430px;height: 500px;position: absolute;margin-top: 5px;left: 0px;display:none;background-color:rgb(39,40,34)';

	container.setAttribute('style', 'margin-top:-35px;color: white;height: 30px;width: 100%;border-bottom-style: solid;border-bottom-width: 1px;border-color: red;text-align: left;font-family: Calibri;font-size: 12pt;padding-top: 5px;position: absolute;z-index: 999999999999;background-color:rgb(39,40,34);');
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

	inputElementsJSONButton.appendChild(document.createTextNode('JSON'));
	inputElementsJSONButton.setAttribute('style', buttonCss);
	inputElementsJSONButton.style.marginLeft = '220px';
	inputElementsJSONButton.style.position = 'absolute';

	refreshFormSelect.appendChild(document.createTextNode('Refresh list'));
	refreshFormSelect.setAttribute('style', buttonCss);

	userDefinedDataTextarea.id = 'fa_user-defined-data';
	userDefinedDataTextarea.class = 'fa_ignore-element';
	userDefinedDataTextarea.setAttribute('style', textareaCss);
	userDefinedDataTextarea.placeholder = 'JSON: key is element id or name and value is element value.\n{ "elementID" : "some value" }';

	userDefinedDataTextareaToggleButton.appendChild(document.createTextNode('Predefined data'));
	userDefinedDataTextareaToggleButton.setAttribute('style', 'margin-left: 10px;font-family: calibri;color: black;line-height: 100%;padding: 2px;height: 23px;min-width: initial;width: initial;font-size: 12px;position:absolute')

	ignoreTextarea.id = 'fa_ignore-list';
	ignoreTextarea.class = 'fa_ignore-element';
	ignoreTextarea.setAttribute('style', textareaCss);
	ignoreTextarea.placeholder = 'JSON: key is element id or name. Value is ignored.\n{ "elementID" : "ignored" }';

	ignoreTextareaToggleButton.appendChild(document.createTextNode('Ignored elements'));
	ignoreTextareaToggleButton.setAttribute('style', 'margin-left: 10px;font-family: calibri;color: black;line-height: 100%;padding: 2px;height: 23px;min-width: initial;width: initial;font-size: 12px;position:absolute;margin-left: 110px;')

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
			predefinedTextareaShowing = false;
			userDefinedDataTextarea.style.display = 'none';
			ignoreTextareaShowing = false;
			ignoreTextarea.style.display = 'none';
		}

	}, true);

	userDefinedDataTextarea.addEventListener('change', function() {

		try {
			var newValue = document.getElementById('fa_user-defined-data').value || null;
			userDefinedValues = JSON.parse(newValue);

			if (newValue == null) {
				delete localStorage.userDefinedValues;
			} else {
				localStorage.userDefinedValues = newValue;
			}
		}
		catch(error) {
			alert("Not a valid JSON. Check console for more details");
			console.log("JSON is not valid", error);
		}

	}, true);

	inputElementsJSONButton.addEventListener('click', function() {

		console.log('Input elements:\n', getInputElementsJSON());
		alert('Check the console to see a list of the input elements found');

	});

	userDefinedDataTextareaToggleButton.addEventListener('click', function() {

		if (predefinedTextareaShowing) {
			userDefinedDataTextarea.style.display = 'none';
		} else {

			if (ignoreTextareaShowing) {
				ignoreTextarea.style.display = 'none';
				ignoreTextareaShowing = false;
			}

			userDefinedDataTextarea.style.display = 'block';
		}

		predefinedTextareaShowing = !predefinedTextareaShowing;

	});

	ignoreTextarea.addEventListener('change', function() {

		try {
			var newValue = document.getElementById('fa_ignore-list').value || null;
			ignoredElements = JSON.parse(newValue);

			if (newValue == null) {
				delete localStorage.ignoredElements;
			} else {
				localStorage.ignoredElements = newValue;
			}
		}
		catch(error) {
			alert("Not a valid JSON. Check console for more details");
			console.log("JSON is not valid", error);
		}

	}, true);

	ignoreTextareaToggleButton.addEventListener('click', function() {

		if (ignoreTextareaShowing) {
			ignoreTextarea.style.display = 'none';
		} else {

			if (predefinedTextareaShowing) {
				userDefinedDataTextarea.style.display = 'none';
				predefinedTextareaShowing = false;
			}

			ignoreTextarea.style.display = 'block';
		}

		ignoreTextareaShowing = !ignoreTextareaShowing;

	});

	containerBar.addEventListener('click', function() {

		if (document.getElementById('fa_hide-checkbox').checked) {
			containerBar.style.height = '0px';
			container.style.marginTop = '0px';

			document.getElementById('fa_hide-checkbox').checked = false;
		}

	});

	//  Dom
	optionsContainer.appendChild(completeButton);
	optionsContainer.appendChild(resetButton);
	optionsContainer.appendChild(requiredLabel);
	optionsContainer.appendChild(emptyLabel);
	optionsContainer.appendChild(toggleContainerLabel);
	optionsContainer.appendChild(ignoreSelectLabel);
	optionsContainer.appendChild(formSelect);
	// Refresh button is temporarily disabled...
	// optionsContainer.appendChild(refreshFormSelect);
	optionsContainer.appendChild(userDefinedDataTextareaToggleButton);
	optionsContainer.appendChild(ignoreTextareaToggleButton);
	optionsContainer.appendChild(inputElementsJSONButton);
	optionsContainer.appendChild(userDefinedDataTextarea);
	optionsContainer.appendChild(ignoreTextarea);
	container.appendChild(optionsContainer);
	container.appendChild(containerBar);

	document.body.insertBefore(container, document.body.firstChild);

	// Init
	var predefinedValues = localStorage.userDefinedValues || null;
	userDefinedValues = JSON.parse(predefinedValues);
	document.getElementById('fa_user-defined-data').value = predefinedValues;

	var predefinedIgnoredElements = localStorage.ignoredElements || null;
	ignoredElements = JSON.parse(predefinedIgnoredElements);
	document.getElementById('fa_ignore-list').value = predefinedIgnoredElements;
};


initFormAutocomplete();