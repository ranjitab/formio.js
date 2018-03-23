import maskInput from 'vanilla-text-mask';
import _ from 'lodash';
import {createNumberMask} from 'text-mask-addons';
import {BaseComponent} from '../base/Base';
import FormioUtils from '../../utils';

export class NumberComponent extends BaseComponent {
  constructor(component, options, data) {
    super(component, options, data);
    this.validators = this.validators.concat(['min', 'max']);

    const separators = FormioUtils.getNumberSeparators(options.language);

    this.decimalSeparator = options.decimalSeparator = options.decimalSeparator
      || separators.decimalSeparator;

    if (component.delimiter) {
      if (options.hasOwnProperty('thousandsSeparator')) {
        console.warn("Property 'thousandsSeparator' is deprecated. Please use i18n to specify delimiter.");
      }

      this.delimiter = options.thousandsSeparator || separators.delimiter;
    }
    else {
      this.delimiter = '';
    }

    this.decimalLimit = FormioUtils.getNumberDecimalLimit(this.component);
    // Currencies to override BrowserLanguage Config. Object key {}
    if (this.options.languageOverride && this.options.languageOverride.hasOwnProperty(options.language || 'en')) {
      this.decimalSeparator = this.options.languageOverride[options.language || 'en'].decimalSeparator;
      this.delimiter = this.options.languageOverride[options.language || 'en'].delimiter;
    }
  }

  parseNumber(value) {
    // Remove delimiters and convert decimal separator to dot.
    value = value.split(this.delimiter).join('').replace(this.decimalSeparator, '.');

    if (this.component.validate && this.component.validate.integer) {
      return parseInt(value, 10);
    }
    else {
      return parseFloat(value);
    }
  }

  setInputMask(input) {
    console.log(this.decimalSeparator);
    console.log(this.decimalSeparator);
    this.inputMask = maskInput({
      inputElement: input,
      mask: createNumberMask({
        prefix: '',
        suffix: '',
        thousandsSeparatorSymbol: _.get(this.component, 'thousandsSeparator', this.delimiter),
        decimalSymbol: _.get(this.component, 'decimalSymbol', this.decimalSeparator),
        decimalLimit: _.get(this.component, 'decimalLimit', this.decimalLimit),
        allowNegative: _.get(this.component, 'allowNegative', true),
        allowDecimal: _.get(this.component, 'allowDecimal',
          !(this.component.validate && this.component.validate.integer))
      })
    });
  }

  elementInfo() {
    const info = super.elementInfo();
    info.attr.type = 'text';
    info.attr.inputmode = 'numeric';
    info.changeEvent = 'input';
    return info;
  }

  getValueAt(index) {
    if (!this.inputs.length || !this.inputs[index]) {
      return null;
    }

    const val = this.inputs[index].value;

    if (!val) {
      return null;
    }

    return this.parseNumber(val);
  }

  clearInput(input) {
    let value = parseFloat(input);

    if (!_.isNaN(value)) {
      value = String(value).replace('.', this.decimalSeparator);
    }
    else {
      value = null;
    }

    return value;
  }

  formatValue(value) {
    return value;
  }

  setValueAt(index, value) {
    value = this.clearInput(value);
    value = this.formatValue(value);
    this.inputMask.textMaskInputElement.update(value);
  }
}
