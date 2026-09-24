(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngValidatorHelper', function (toastr) {
        
        /** Label shown to the user for an invalid control: its <label>, else a readable version of its name. */
        var labelFor = function (el, name) {
            var text = '';
            if (el) {
                var id = el.getAttribute('id');
                var byFor = id ? document.querySelector('label[for="' + id + '"]') : null;
                var group = el.closest('.form-group, .pof-field, td, .col-sm-4, .col-sm-6');
                var lbl = byFor || (group && group.querySelector('label, .control-label'));
                text = lbl ? (lbl.textContent || '') : '';
                if (!text && el.closest('td')) {
                    var cell = el.closest('td'), table = el.closest('table');
                    var th = table && table.querySelectorAll('thead th')[cell.cellIndex];
                    text = th ? th.textContent : '';
                }
            }
            if (!text) {
                text = String(name || '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
            }
            return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
        };

        /**
         * Validates $scope.item_form. When something is missing it now tells the user which fields and
         * moves focus to the first one (it used to fail silently, so buttons looked dead).
         */
        var validateForm = function ($scope, item_form) {
            var form = $scope.item_form;
            if (!form) {
                return true;
            }
            form.$triedSubmit = true;
            if (form.$valid) {
                return true;
            }
            // Visible invalid controls of the visible form(s) named item_form (a popup may sit over a page).
            var forms = Array.prototype.filter.call(document.querySelectorAll('form[name="item_form"]'), function (f) {
                return f.offsetParent !== null;
            });
            var formEl = forms[forms.length - 1];
            var controls = formEl ? Array.prototype.filter.call(formEl.querySelectorAll('.ng-invalid[name], .ng-invalid [name]'), function (el) {
                return el.offsetParent !== null && el.tagName !== 'FORM';
            }) : [];
            var labels = [];
            controls.forEach(function (el) {
                var label = labelFor(el, el.getAttribute('name'));
                if (label && labels.indexOf(label) < 0) {
                    labels.push(label);
                }
            });
            if (labels.length) {
                toastr.error('Please fill in: ' + labels.slice(0, 5).join(', ') + (labels.length > 5 ? ' and ' + (labels.length - 5) + ' more' : ''));
                var first = controls[0];
                if (first) {
                    if (first.scrollIntoView) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
                    var focusable = first.matches('input, select, textarea, button') ? first : first.querySelector('input, select, textarea, button');
                    if (focusable && focusable.focus) { focusable.focus(); }
                }
            } else {
                toastr.error('Please complete the required fields.');
            }
            return false;
        };

        return {
            validate : validateForm,
        };
    });

})();